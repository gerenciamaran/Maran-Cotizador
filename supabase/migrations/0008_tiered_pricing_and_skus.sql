-- Precios escalonados por tramo de tamaño de sistema (RETIE, Trámite ante el
-- OR, Estudio de conexión = precio fijo total por tramo; UPME/Medidor
-- bidireccional/Telecomunicador/Smart meter = tarifa por kWp que sube de
-- tramo) + catálogo de modelos (SKU) seleccionables de panel e inversor.
--
-- Reglas confirmadas con el usuario (ver conversación): los tramos de
-- RETIE/OR/Estudio son compuestos (cada % aplica sobre el valor ya
-- incrementado del tramo anterior, no sobre la base original).

-- 1. Ampliar unit_type para los dos nuevos modelos de precio.
alter table public.price_catalog drop constraint price_catalog_unit_type_check;
alter table public.price_catalog add constraint price_catalog_unit_type_check
  check (unit_type in ('per_wp', 'per_kwp', 'flat', 'percent', 'tiered_flat', 'tiered_rate'));

-- 2. Tramos por ítem del catálogo (genérico, editable por admin).
create table public.price_tiers (
  id uuid primary key default gen_random_uuid(),
  price_catalog_id uuid not null references public.price_catalog(id) on delete cascade,
  band_order int not null,
  min_kwp numeric(10, 2) not null,
  max_kwp numeric(10, 2), -- null = sin límite superior
  multiplier_pct numeric(6, 2) not null default 0, -- % sobre el valor del tramo anterior (compuesto)
  unique (price_catalog_id, band_order)
);

alter table public.price_tiers enable row level security;

create policy "price_tiers_select_authenticated" on public.price_tiers
  for select to authenticated using (true);
create policy "price_tiers_write_admin_only" on public.price_tiers
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

grant select, insert, update, delete on public.price_tiers to authenticated;
grant select, insert, update, delete on public.price_tiers to service_role;

-- 3. Modelos (SKU) de panel/inversor seleccionables por cotización.
create table public.product_skus (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('panel', 'inverter')),
  brand text not null,
  model text not null,
  capacity_label text,
  unit_type text not null check (unit_type in ('per_wp', 'per_kwp')),
  unit_cost_cop numeric(14, 2) not null,
  is_default boolean not null default false,
  is_active boolean not null default true,
  notes text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index one_default_sku_per_category on public.product_skus(category) where is_default;

alter table public.product_skus enable row level security;

create policy "product_skus_select_authenticated" on public.product_skus
  for select to authenticated using (true);
create policy "product_skus_write_admin_only" on public.product_skus
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

grant select, insert, update, delete on public.product_skus to authenticated;
grant select, insert, update, delete on public.product_skus to service_role;

-- 4. La cotización recuerda qué modelo de panel/inversor se usó al generar
-- el presupuesto (nullable: las cotizaciones viejas quedan en null, su
-- budget_breakdown congelado no se toca).
alter table public.quotes
  add column panel_sku_id uuid references public.product_skus(id),
  add column inverter_sku_id uuid references public.product_skus(id);

-- 5. Migrar los datos existentes.

-- 5a. Panel e inversor pasan de fila de catálogo a SKU por defecto.
insert into public.product_skus (category, brand, model, capacity_label, unit_type, unit_cost_cop, is_default, notes)
select 'panel', 'MARÁN ENERGY', name, '615 Wp', unit_type, unit_cost_cop, true, notes
from public.price_catalog where name = 'Paneles solares 615W';

insert into public.product_skus (category, brand, model, capacity_label, unit_type, unit_cost_cop, is_default, notes)
select 'inverter', 'Growatt', '20kW', '20 kW', unit_type, unit_cost_cop, true, notes
from public.price_catalog where name = 'Inversor 20kW Growatt';

delete from public.price_catalog where name in ('Paneles solares 615W', 'Inversor 20kW Growatt');

-- 5b. RETIE / Trámite ante el OR / Estudio de conexión -> tiered_flat con
-- su valor base (0-10kW) y los tramos compuestos.
update public.price_catalog set unit_type = 'tiered_flat', unit_cost_cop = 1500000.00
where name = 'RETIE';
update public.price_catalog set unit_type = 'tiered_flat', unit_cost_cop = 1500000.00
where name = 'Trámite ante el OR';
update public.price_catalog set unit_type = 'tiered_flat', unit_cost_cop = 2500000.00
where name = 'Estudio de conexión';

insert into public.price_tiers (price_catalog_id, band_order, min_kwp, max_kwp, multiplier_pct)
select id, band_order, min_kwp, max_kwp, multiplier_pct
from public.price_catalog, (values
  (0, 0::numeric, 10::numeric, 0::numeric),
  (1, 10, 30, 30),
  (2, 30, 50, 30),
  (3, 50, 70, 30),
  (4, 70, 99, 30),
  (5, 99, 200, 200),
  (6, 200, 300, 30),
  (7, 300, 400, 20),
  (8, 400, 500, 10),
  (9, 500, 1000, 0)
) as bands(band_order, min_kwp, max_kwp, multiplier_pct)
where price_catalog.name in ('RETIE', 'Trámite ante el OR', 'Estudio de conexión');

-- 5c. UPME / Medidor bidireccional / Telecomunicador / Smart meter ->
-- tiered_rate (conservan su tarifa/kWp actual, solo se le agrega el
-- escalón de +25% por encima de 99kW).
update public.price_catalog set unit_type = 'tiered_rate'
where name in ('UPME', 'Medidor bidireccional', 'Telecomunicador', 'Smart meter');

insert into public.price_tiers (price_catalog_id, band_order, min_kwp, max_kwp, multiplier_pct)
select id, band_order, min_kwp, max_kwp, multiplier_pct
from public.price_catalog, (values
  (0, 0::numeric, 99::numeric, 0::numeric),
  (1, 99, 1000, 25)
) as bands(band_order, min_kwp, max_kwp, multiplier_pct)
where price_catalog.name in ('UPME', 'Medidor bidireccional', 'Telecomunicador', 'Smart meter');
