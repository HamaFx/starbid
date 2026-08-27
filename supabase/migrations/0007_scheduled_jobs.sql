create extension if not exists pg_cron;

select cron.schedule('expire-stale-pending', '*/15 * * * *',
  $$select public.expire_stale_pending();$$);

select cron.schedule('recompute-zones', '*/2 * * * *',
  $$select public.recompute_zones();$$);

select cron.schedule('trim-realtime-events', '0 3 * * *',
  $$delete from public.realtime_events where created_at < now() - interval '2 hours';$$);

select cron.schedule('trim-action-grants', '0 3 * * *',
  $$delete from public.action_grants where expires_at < now();$$);
