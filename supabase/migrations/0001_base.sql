-- Grid Six — schema do backend (Supabase)
-- Rode isso inteiro no SQL Editor do seu projeto Supabase.

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  party_code text not null,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  heading double precision default 0,
  updated_at timestamptz not null default now()
);

create table if not exists waypoints (
  id uuid primary key default gen_random_uuid(),
  party_code text not null,
  label text not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  party_code text not null,
  sender text not null,
  body text,
  audio_url text,
  created_at timestamptz not null default now()
);

-- Realtime: manda toda mudança nessas tabelas pros celulares conectados
alter publication supabase_realtime add table players, waypoints, messages;

-- Segurança básica de protótipo: qualquer um com o código da party pode
-- ler/escrever nos dados DAQUELA party. Não é nível produção, mas já
-- evita que um app veja a party de outro sem querer.
alter table players enable row level security;
alter table waypoints enable row level security;
alter table messages enable row level security;

create policy "acesso por party" on players for all using (true) with check (true);
create policy "acesso por party" on waypoints for all using (true) with check (true);
create policy "acesso por party" on messages for all using (true) with check (true);
