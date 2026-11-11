-- Rode isso no SQL Editor do Supabase

-- Perfis (um por conta de usuário)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  callsign text not null,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "perfis sao publicos para leitura" on profiles for select using (true);
create policy "usuario cria seu proprio perfil" on profiles for insert with check (auth.uid() = id);
create policy "usuario edita seu proprio perfil" on profiles for update using (auth.uid() = id);

-- Amizades
create table if not exists friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique(user_id, friend_id)
);
alter table friends replica identity full;
alter publication supabase_realtime add table friends;
alter table friends enable row level security;
create policy "ver amizades que envolvem voce" on friends for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "criar pedido de amizade" on friends for insert with check (auth.uid() = user_id);
create policy "atualizar amizade que envolve voce" on friends for update using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "excluir amizade que envolve voce" on friends for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- Convites de party
create table if not exists party_invites (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  party_code text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table party_invites replica identity full;
alter publication supabase_realtime add table party_invites;
alter table party_invites enable row level security;
create policy "ver convites que envolvem voce" on party_invites for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy "criar convite" on party_invites for insert with check (auth.uid() = from_user);
create policy "atualizar convite que envolve voce" on party_invites for update using (auth.uid() = to_user or auth.uid() = from_user);
