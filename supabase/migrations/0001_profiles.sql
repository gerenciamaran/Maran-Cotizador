-- Perfiles de usuario interno (ventas/admin). El registro de auth.users se
-- crea vía supabase.auth.signUp(); esta tabla guarda datos adicionales.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'sales' check (role in ('admin', 'sales')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer para evitar recursión de RLS al chequear el rol de otro
-- usuario (mismo patrón usado en maran-energy).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role = 'admin' from public.profiles where id = uid), false);
$$;

create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin(auth.uid()));

-- Tablas creadas por SQL crudo no reciben grants automáticos para
-- authenticated/anon/service_role: hay que otorgarlos explícitamente o toda
-- consulta falla con "permission denied for table X" aunque las políticas
-- RLS estén bien.
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.profiles to service_role;
