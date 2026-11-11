-- Rode só isso no SQL Editor do Supabase

alter table players add column if not exists team text;
alter table players add column if not exists is_admin boolean default false;

create table if not exists reveals (
  id uuid primary key default gen_random_uuid(),
  party_code text not null,
  team text not null,
  expires_at timestamptz not null
);

alter table reveals replica identity full;
alter publication supabase_realtime add table reveals;

alter table reveals enable row level security;
create policy "acesso por party" on reveals for all using (true) with check (true);
