-- Rode só isso no SQL Editor do Supabase (cria o espaço pra guardar os áudios)
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

create policy "leitura publica de audio" on storage.objects
  for select using (bucket_id = 'audio');

create policy "upload de audio" on storage.objects
  for insert with check (bucket_id = 'audio');
