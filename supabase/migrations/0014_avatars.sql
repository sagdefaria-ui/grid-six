-- Rode isso no SQL Editor do Supabase
alter table players add column if not exists avatar_emoji text;
alter table players add column if not exists avatar_photo_url text;
