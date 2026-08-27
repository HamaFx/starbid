create or replace function public.recompute_zones()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.zone_snapshots (id, boundaries, computed_at)
  select 1, jsonb_build_object(
    'total_active', count(*),
    'photon_ring_cutoff', greatest(5, ceil(count(*) * 0.01)),
    'inner_disk_cutoff', ceil(count(*) * 0.06),
    'mid_disk_cutoff', ceil(count(*) * 0.26)
  ), now()
  from public.stars
  where status = 'active'
  on conflict (id) do update set
    boundaries = excluded.boundaries,
    computed_at = excluded.computed_at;
$$;
