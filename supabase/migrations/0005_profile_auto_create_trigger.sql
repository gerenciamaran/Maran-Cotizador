-- Crea el perfil automáticamente vía trigger (en vez de un insert desde el
-- cliente en registerAction): si la confirmación de correo está activada,
-- justo después de signUp() todavía no hay sesión, así que un insert hecho
-- desde el cliente cae al rol anon (sin permiso) y falla con
-- "permission denied for table profiles". El trigger corre con los
-- privilegios del dueño de la función (security definer), así que no
-- depende de qué rol esté autenticado en ese momento.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
