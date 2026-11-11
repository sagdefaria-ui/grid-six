-- Rode isso no SQL Editor do Supabase

-- Cria o perfil automaticamente assim que uma conta é criada (lado do servidor,
-- não depende de sessão ativa no navegador, então nunca falha por causa da
-- confirmação de e-mail).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, callsign)
  values (new.id, coalesce(new.raw_user_meta_data->>'callsign', 'OP-' || floor(random()*900+100)::text))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
