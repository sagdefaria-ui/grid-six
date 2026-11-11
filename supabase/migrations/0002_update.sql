-- Rode isso no SQL Editor do Supabase (além do schema.sql que você já rodou)
alter table waypoints add column if not exists icon text default '📍';
alter table waypoints add column if not exists color text default '#E85D24';
