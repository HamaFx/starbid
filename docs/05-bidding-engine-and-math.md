# Bidding Engine & Math

## Ranking rule (the entire game, one sentence)
**Position = live descending rank by `stars.total_bid_cents`.** No
refunds, no per-slot "current price" other than the #1 Singularity check.
All ranking is **permanent / lifetime cumulative**. No decay in v1
(see doc 00 decision log and post-launch monitoring notes).

## The one special case: Singularity (#1)
A confirming payment may only make its star **rank #1** if the star's
resulting total is **≥ 115%** of the current #1's total. If it doesn't
clear that bar, the money still counts (added to `total_bid_cents`,
no refund) — it just lands at whatever rank that total actually earns.

```
required_to_take_singularity = current_singularity.total_bid_cents * 1.15
```
This check only gates the *singularity* rank; every other position is
decided purely by `ORDER BY total_bid_cents DESC`.

Tie-break: equal totals → earlier `entered_at` keeps the higher rank
(first-mover, deterministic, no coin flip).

**Banned / withdrawn Singularity handling**: If the current #1 has
`status != 'active'`, it is ignored for ranking and singularity checks.
The next highest active star becomes the effective #1 immediately.
No immunity is transferred.

## Anti-snipe immunity
On a successful takeover of rank #1, set
`stars.immunity_until = now() + interval '60 seconds'`. During this
window, `confirm_pending` still accepts payments toward that star's rival,
but a **new** singularity challenge against the immune star is rejected at
confirm time — the paying user's money still lands (no refund possible
anyway, since it's already charged), but is simply added at their current
rank rather than triggering a takeover. This exists only to stop
bot-vs-bot flip-wars on the single most contested slot.

## Cost-to-rank calculator (required UX)
Every fuel / manage surface and the public star page must show a live
calculator:
- "Add $X to take the Singularity (needs ≥ 115% of current #1)"
- "Add $Y to reach rank N / reclaim your previous peak"
- Preset buttons for common targets + custom amount (min $3)

This is the practical equivalent of outbid.lol-style "pay the difference":
the user always pays exactly the amount they choose to *add*, and the UI
makes the minimum required to achieve a goal completely transparent.
Implementation: pure client-side math from `public_stars` + current
`total_bid_cents` (see `lib/math/rankTargets.ts`).

## `confirm_pending` — the one function where money becomes rank
File: `supabase/sql/functions/confirm_pending.sql` (kept under ~150 lines;
shown here in full because it is the single most important piece of logic
in the whole system and deserves to be reviewed as a unit).

```sql
create or replace function confirm_pending(
  p_pending_id uuid,
  p_ls_order_id text
) returns table(star_id uuid, event_type text)
language plpgsql security definer as $$
declare
  v_pending      pending_bids%rowtype;
  v_star         stars%rowtype;
  v_singularity  stars%rowtype;
  v_event_type   text := 'fuel';
  v_new_star_id  uuid;
begin
  -- idempotency: unique constraint does the real work; this is a fast-path exit
  if exists (select 1 from pending_bids where lemonsqueezy_order_id = p_ls_order_id) then
    return query select s.id, 'noop' from stars s limit 0; -- already processed
  end if;

  select * into v_pending from pending_bids
    where id = p_pending_id and status = 'awaiting_payment'
    for update;
  if not found then
    raise exception 'pending bid not found or already processed';
  end if;

  if v_pending.kind = 'new_star' then
    insert into projects (name, logo_url, link_url, x_handle, email, claim_token_hash)
      select (v_pending.project_draft->>'name'),
             (v_pending.project_draft->>'logo_url'),
             (v_pending.project_draft->>'link_url'),
             (v_pending.project_draft->>'x_handle'),
             lower(v_pending.project_draft->>'email'),
             v_pending.claim_token_hash
      returning id into v_new_star_id;

    insert into stars (project_id, total_bid_cents, d_name, d_logo_url, d_link_url, d_x_handle)
      select v_new_star_id, v_pending.amount_cents,
             (v_pending.project_draft->>'name'),
             (v_pending.project_draft->>'logo_url'),
             (v_pending.project_draft->>'link_url'),
             (v_pending.project_draft->>'x_handle')
      returning * into v_star;

    v_event_type := 'spawn';
  else
    select * into v_star from stars where id = v_pending.star_id for update;
    update stars set total_bid_cents = total_bid_cents + v_pending.amount_cents,
                      updated_at = now()
      where id = v_star.id returning * into v_star;
  end if;

  -- singularity challenge check (only relevant if this star just became top-ranked)
  -- Lock order: we already hold v_star FOR UPDATE. Now lock the current #1
  -- (if different) so concurrent confirms are serialized by Postgres.
  select * into v_singularity from stars
    where status = 'active' and id <> v_star.id
    order by total_bid_cents desc, entered_at asc
    limit 1
    for update;

  if found and v_star.total_bid_cents > v_singularity.total_bid_cents then
    if v_singularity.immunity_until is not null and v_singularity.immunity_until > now() then
      -- immune: money already applied above, takeover just doesn't register as "singularity" event
      null;
    elsif v_star.total_bid_cents >= (v_singularity.total_bid_cents * 115) / 100 then
      -- integer-safe 15% check (avoids float). 115% of X = (X * 115) / 100
      update stars set immunity_until = now() + interval '60 seconds' where id = v_star.id;
      v_event_type := 'singularity_takeover';
    end if;
    -- else: money still counted toward v_star.total_bid_cents; just doesn't take #1 yet
  end if;

  -- Note: if the previous #1 was banned/withdrawn, the SELECT above already
  -- skipped it (status = 'active' filter), so the next active star is treated
  -- as the effective singularity target. No special case needed.

  update pending_bids set status = 'confirmed', confirmed_at = now(),
                           lemonsqueezy_order_id = p_ls_order_id
    where id = p_pending_id;

  insert into bid_events (star_id, project_id, pending_bid_id, amount_cents,
                           resulting_total_cents, event_type)
    values (v_star.id, v_star.project_id, p_pending_id, v_pending.amount_cents,
            v_star.total_bid_cents, v_event_type);

  -- fan out to realtime_events (public-safe payload only)
  insert into realtime_events (topic, payload)
    values ('galaxy', jsonb_build_object(
      'star_id', v_star.id, 'total_bid_cents', v_star.total_bid_cents,
      'event_type', v_event_type, 'name', v_star.d_name));

  return query select v_star.id, v_event_type;
end;
$$;
```

## Visual formulas
File: `lib/math/orbit.ts` — pure functions, zero I/O, fully unit-tested.

**Radius** (distance from center):
```ts
export function radius(totalBidDollars: number, rMax: number): number {
  return rMax / (1 + Math.log(1 + totalBidDollars));
}
```
**Size** (logo diameter, clamped):
```ts
export function size(totalBidDollars: number): number {
  return clamp(12 + 10 * Math.log(1 + totalBidDollars), 12, 80);
}
```
**Angular velocity** (cosmetic, computed client-side per frame, never stored):
```ts
export function angularVelocity(radiusPx: number, baseSpeed = 40): number {
  return baseSpeed / Math.sqrt(radiusPx);
}
```
`angle_seed` is set once at creation and never changes — only radius moves,
so a star drifts in/out along a stable angular position rather than
teleporting around the ring.

## Zone banding (cosmetic only)
File: `supabase/sql/functions/recompute_zones.sql`, run by `pg_cron` every
2 minutes:
```sql
create or replace function recompute_zones() returns void
language sql as $$
  insert into zone_snapshots (id, boundaries, computed_at)
  select 1, jsonb_build_object(
    'total_active', count(*),
    'photon_ring_cutoff', greatest(5, ceil(count(*) * 0.01)),
    'inner_disk_cutoff',  ceil(count(*) * 0.06),
    'mid_disk_cutoff',    ceil(count(*) * 0.26)
  ), now()
  from stars where status = 'active'
  on conflict (id) do update set boundaries = excluded.boundaries, computed_at = excluded.computed_at;
$$;
```
Bands are percentile-based, not fixed dollar amounts, so the game
self-balances as average spend grows over time (doc 00 rationale).

## Cleanup jobs (pg_cron)
```sql
-- every 15 min
select cron.schedule('expire-stale-pending', '*/15 * * * *',
  $$update pending_bids set status='expired'
    where status='awaiting_payment' and created_at < now() - interval '30 minutes';$$);

-- every 2 min
select cron.schedule('recompute-zones', '*/2 * * * *', $$select recompute_zones();$$);

-- daily
select cron.schedule('trim-realtime-events', '0 3 * * *',
  $$delete from realtime_events where created_at < now() - interval '2 hours';$$);
select cron.schedule('trim-action-grants', '0 3 * * *',
  $$delete from action_grants where expires_at < now();$$);
```

## Anti-spam / anti-abuse
- Every `create_pending_*` call requires a fresh, single-use
  `action_grants` row (proof of passed Turnstile check).
- Upstash rate limits: max 3 pending-new-star creations per IP per hour;
  max 10 pending-fuel creations per star per hour (blunts checkout-spam
  even though unpaid pending rows cost nothing but a DB row).
- The $3 minimum is itself a spam deterrent — there is no free action that
  writes to `stars` or `bid_events`.

## Transition animation contract (frontend)
When a star's rank/radius changes, the client tweens position over ~2
seconds with an `ease-out-expo` curve — never an instant jump. This is a
product requirement (the "watch it move" spectacle), implemented in
`components/galaxy/useOrbitTween.ts`, decoupled from the math functions
above so the easing curve can be tuned without touching ranking logic.