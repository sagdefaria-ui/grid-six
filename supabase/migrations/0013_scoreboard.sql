-- Rode isso no SQL Editor do Supabase

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  party_code text not null,
  name text,
  started_at timestamptz not null default now()
);
alter table matches replica identity full;
alter publication supabase_realtime add table matches;
alter table matches enable row level security;
create policy "acesso por party" on matches for all using (true) with check (true);

create table if not exists match_scores (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id text not null,
  player_name text not null,
  kills int not null default 0,
  deaths int not null default 0,
  updated_at timestamptz not null default now(),
  unique(match_id, player_id)
);
alter table match_scores replica identity full;
alter publication supabase_realtime add table match_scores;
alter table match_scores enable row level security;
create policy "acesso por party" on match_scores for all using (true) with check (true);
