-- Rode só isso no SQL Editor do Supabase
alter table messages add column if not exists kind text default 'chat';
alter table messages add column if not exists lat double precision;
alter table messages add column if not exists lng double precision;
