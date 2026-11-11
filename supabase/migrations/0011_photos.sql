-- Rode isso no SQL Editor do Supabase

-- Bucket de fotos do chat
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "leitura publica de fotos" on storage.objects
  for select using (bucket_id = 'photos');
create policy "upload de fotos" on storage.objects
  for insert with check (bucket_id = 'photos');
create policy "excluir arquivos de audio e foto" on storage.objects
  for delete using (bucket_id in ('audio', 'photos'));

-- Colunas novas nas mensagens (guardam o "caminho" do arquivo, não só o link,
-- pra ser possível apagar o arquivo de verdade do armazenamento depois)
alter table messages add column if not exists image_url text;
alter table messages add column if not exists image_path text;
alter table messages add column if not exists audio_path text;
