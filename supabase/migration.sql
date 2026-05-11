create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  overall_score int not null,
  findable_score int not null,
  quotable_score int not null,
  understandable_score int not null,
  trustworthy_score int not null,
  rendering_type text not null,
  raw_word_count int not null,
  rendered_word_count int not null,
  checks jsonb not null,
  created_at timestamp with time zone default now()
);

alter table scans enable row level security;

create policy "Public read" on scans for select using (true);
create policy "Public insert" on scans for insert with check (true);
