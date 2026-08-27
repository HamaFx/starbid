insert into public.projects (id, name, logo_url, link_url, x_handle, email, claim_token_hash, verified, is_founding, is_demo)
values
  ('00000000-0000-0000-0000-000000000001', 'NOVA LABS', 'https://placehold.co/128x128/fff4e0/05050a?text=N', 'https://example.com/nova', '@novalabs', 'nova@example.test', repeat('a', 64), true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'KINETIC TYPE', 'https://placehold.co/128x128/ff6b35/05050a?text=K', 'https://example.com/kinetic', '@kinetictype', 'kinetic@example.test', repeat('b', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000003', 'ORBITAL GOODS', null, 'https://example.com/orbital', null, 'orbital@example.test', repeat('c', 64), false, false, true)
on conflict (id) do update set is_demo = excluded.is_demo, is_founding = excluded.is_founding, verified = excluded.verified;

insert into public.stars (id, project_id, total_bid_cents, angle_seed, d_name, d_logo_url, d_link_url, d_x_handle, d_verified, d_is_founding, d_is_demo)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 12500, 20, 'NOVA LABS', 'https://placehold.co/128x128/fff4e0/05050a?text=N', 'https://example.com/nova', '@novalabs', true, true, true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 4200, 160, 'KINETIC TYPE', 'https://placehold.co/128x128/ff6b35/05050a?text=K', 'https://example.com/kinetic', '@kinetictype', false, false, true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 900, 280, 'ORBITAL GOODS', null, 'https://example.com/orbital', null, false, false, true)
on conflict (id) do update set d_is_demo = excluded.d_is_demo, d_is_founding = excluded.d_is_founding, d_verified = excluded.d_verified;
