create policy "public read star projection" on public.stars
  for select to anon, authenticated using (status = 'active');

create policy "public read project display fields" on public.projects
  for select to anon, authenticated using (is_banned = false);
