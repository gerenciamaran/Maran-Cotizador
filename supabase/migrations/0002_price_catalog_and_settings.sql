-- Catálogo de precios (editable por admin) y configuración global de la app.

create table public.price_catalog (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('panel', 'inverter', 'structure', 'labor', 'other')),
  name text not null,
  unit_type text not null check (unit_type in ('per_wp', 'per_kwp', 'flat', 'percent')),
  unit_cost_cop numeric(14, 2) not null,
  is_active boolean not null default true,
  notes text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.price_catalog enable row level security;

create policy "catalog_select_authenticated" on public.price_catalog
  for select to authenticated using (true);
create policy "catalog_write_admin_only" on public.price_catalog
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

grant select, insert, update, delete on public.price_catalog to authenticated;
grant select, insert, update, delete on public.price_catalog to service_role;

-- Configuración global (fila única, id=1): margen por defecto, performance
-- ratio por defecto, nombre de la empresa para el PDF.
create table public.app_settings (
  id int primary key default 1 check (id = 1),
  default_margin_pct numeric(5, 2) not null default 25.00,
  default_performance_ratio numeric(4, 3) not null default 0.800,
  company_name text not null default 'MARÁN ENERGY',
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (1);

alter table public.app_settings enable row level security;

create policy "settings_select_authenticated" on public.app_settings
  for select to authenticated using (true);
create policy "settings_write_admin_only" on public.app_settings
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

grant select, update on public.app_settings to authenticated;
grant select, update on public.app_settings to service_role;
