alter table public.realtime_events
  add column if not exists event_sequence bigint generated always as identity;

create unique index if not exists realtime_events_event_sequence_idx
  on public.realtime_events (event_sequence);

create or replace function public.emit_galaxy_realtime_event(
  p_star_id uuid,
  p_total_bid_cents bigint,
  p_event_type text,
  p_name text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.realtime_events(topic, payload)
  values (
    'galaxy',
    jsonb_build_object(
      'star_id', p_star_id,
      'total_bid_cents', p_total_bid_cents,
      'event_type', p_event_type,
      'name', p_name,
      'sequence', currval(pg_get_serial_sequence('public.realtime_events', 'event_sequence'))
    )
  );
$$;
