create table public.star_clicks (
  star_id uuid not null references public.stars(id) on delete cascade,
  click_day date not null default current_date,
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  primary key (star_id, click_day, visitor_hash)
);

create index star_clicks_star_day_idx on public.star_clicks (star_id, click_day);
alter table public.star_clicks enable row level security;
