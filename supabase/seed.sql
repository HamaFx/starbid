-- 20 Demo Stars across all thermal accretion zones (Singularity, Photon Ring, Inner, Mid, Outer Rim)
insert into public.projects (id, name, logo_url, link_url, x_handle, email, claim_token_hash, verified, is_founding, is_demo)
values
  ('00000000-0000-0000-0000-000000000001', 'NOVA LABS', null, 'https://example.com/nova', '@novalabs', 'nova@example.test', repeat('a', 64), true, true, true),
  ('00000000-0000-0000-0000-000000000002', 'KINETIC TYPE', null, 'https://example.com/kinetic', '@kinetictype', 'kinetic@example.test', repeat('b', 64), true, true, true),
  ('00000000-0000-0000-0000-000000000003', 'AETHER PROTOCOL', null, 'https://example.com/aether', '@aether', 'aether@example.test', repeat('c', 64), false, true, true),
  ('00000000-0000-0000-0000-000000000004', 'SYNTHESIS AI', null, 'https://example.com/synthesis', '@synthesis', 'synthesis@example.test', repeat('d', 64), false, true, true),
  ('00000000-0000-0000-0000-000000000005', 'VECTOR SHIFT', null, 'https://example.com/vectorshift', '@vectorshift', 'vector@example.test', repeat('e', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000006', 'PULSAR UI', null, 'https://example.com/pulsar', '@pulsarui', 'pulsar@example.test', repeat('f', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000007', 'CHRONO STACK', null, 'https://example.com/chrono', null, 'chrono@example.test', repeat('g', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000008', 'MONOLITH OS', null, 'https://example.com/monolith', '@monolith', 'monolith@example.test', repeat('h', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000009', 'ORBITAL GOODS', null, 'https://example.com/orbital', null, 'orbital@example.test', repeat('i', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000010', 'HYPERION DEV', null, 'https://example.com/hyperion', '@hyperion', 'hyperion@example.test', repeat('j', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000011', 'ZERO GRAV LABS', null, 'https://example.com/zerograv', '@zerograv', 'zerograv@example.test', repeat('k', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000012', 'LUMEN CSS', null, 'https://example.com/lumencss', null, 'lumen@example.test', repeat('l', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000013', 'QUASAR DB', null, 'https://example.com/quasardb', '@quasardb', 'quasar@example.test', repeat('m', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000014', 'STELLAR FORGE', null, 'https://example.com/stellar', null, 'stellar@example.test', repeat('n', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000015', 'APOLLO LOGS', null, 'https://example.com/apollologs', null, 'apollo@example.test', repeat('o', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000016', 'DRIFT ENGINE', null, 'https://example.com/drift', null, 'drift@example.test', repeat('p', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000017', 'VOXEL MATRIX', null, 'https://example.com/voxel', null, 'voxel@example.test', repeat('q', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000018', 'COSMIC PIPES', null, 'https://example.com/cosmic', null, 'cosmic@example.test', repeat('r', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000019', 'ECHO ROUTER', null, 'https://example.com/echo', null, 'echo@example.test', repeat('s', 64), false, false, true),
  ('00000000-0000-0000-0000-000000000020', 'NEBULA CACHE', null, 'https://example.com/nebula', null, 'nebula@example.test', repeat('t', 64), false, false, true)
on conflict (id) do update set is_demo = excluded.is_demo, is_founding = excluded.is_founding, verified = excluded.verified;

insert into public.stars (id, project_id, total_bid_cents, angle_seed, d_name, d_logo_url, d_link_url, d_x_handle, d_verified, d_is_founding, d_is_demo)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 15000, 20, 'NOVA LABS', null, 'https://example.com/nova', '@novalabs', true, true, true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 8500, 160, 'KINETIC TYPE', null, 'https://example.com/kinetic', '@kinetictype', true, true, true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 6400, 290, 'AETHER PROTOCOL', null, 'https://example.com/aether', '@aether', false, true, true),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 4500, 45, 'SYNTHESIS AI', null, 'https://example.com/synthesis', '@synthesis', false, true, true),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 3200, 210, 'VECTOR SHIFT', null, 'https://example.com/vectorshift', '@vectorshift', false, false, true),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 2400, 115, 'PULSAR UI', null, 'https://example.com/pulsar', '@pulsarui', false, false, true),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 1800, 330, 'CHRONO STACK', null, 'https://example.com/chrono', null, false, false, true),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', 1400, 75, 'MONOLITH OS', null, 'https://example.com/monolith', '@monolith', false, false, true),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000009', 1100, 250, 'ORBITAL GOODS', null, 'https://example.com/orbital', null, false, false, true),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', 900, 140, 'HYPERION DEV', null, 'https://example.com/hyperion', '@hyperion', false, false, true),
  ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', 800, 305, 'ZERO GRAV LABS', null, 'https://example.com/zerograv', '@zerograv', false, false, true),
  ('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000012', 700, 15, 'LUMEN CSS', null, 'https://example.com/lumencss', null, false, false, true),
  ('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000013', 600, 185, 'QUASAR DB', null, 'https://example.com/quasardb', '@quasardb', false, false, true),
  ('10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000014', 500, 270, 'STELLAR FORGE', null, 'https://example.com/stellar', null, false, false, true),
  ('10000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000015', 450, 95, 'APOLLO LOGS', null, 'https://example.com/apollologs', null, false, false, true),
  ('10000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000016', 400, 225, 'DRIFT ENGINE', null, 'https://example.com/drift', null, false, false, true),
  ('10000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000017', 350, 345, 'VOXEL MATRIX', null, 'https://example.com/voxel', null, false, false, true),
  ('10000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000018', 300, 60, 'COSMIC PIPES', null, 'https://example.com/cosmic', null, false, false, true),
  ('10000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000019', 300, 170, 'ECHO ROUTER', null, 'https://example.com/echo', null, false, false, true),
  ('10000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000020', 300, 280, 'NEBULA CACHE', null, 'https://example.com/nebula', null, false, false, true)
on conflict (id) do update set d_is_demo = excluded.d_is_demo, d_is_founding = excluded.d_is_founding, d_verified = excluded.d_verified;
