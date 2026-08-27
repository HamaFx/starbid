create policy "deny anonymous project reads" on public.projects for select using (false);
create policy "deny anonymous star reads" on public.stars for select using (false);
create policy "deny anonymous pending reads" on public.pending_bids for select using (false);
create policy "deny anonymous bid history reads" on public.bid_events for select using (false);
create policy "deny anonymous zone reads" on public.zone_snapshots for select using (false);
create policy "deny anonymous grant reads" on public.action_grants for select using (false);
create policy "deny anonymous moderation reads" on public.moderation_flags for select using (false);

