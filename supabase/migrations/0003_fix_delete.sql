-- Rode só isso no SQL Editor do Supabase (corrige a exclusão em tempo real)
alter table waypoints replica identity full;
alter table players replica identity full;
alter table messages replica identity full;
