-- Registro central de cada cotización, llenado progresivamente durante el
-- asistente de 4 pasos (factura/OCR → cliente → cálculo → presupuesto/PDF).

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'calculated', 'sent', 'won', 'lost')),
  created_by uuid not null references public.profiles(id),

  -- Paso 2: datos de cliente/proyecto
  client_company_name text,
  client_nit text,
  client_contact_name text,
  client_contact_email text,
  client_contact_phone text,
  address text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),

  -- Paso 1: factura / OCR
  bill_image_path text,
  monthly_consumption_kwh numeric(10, 2),
  tariff_cop_per_kwh numeric(10, 2),
  ocr_raw_text text,
  ocr_confidence text check (ocr_confidence in ('auto', 'user_corrected', 'manual')),

  -- Paso 3: dimensionamiento
  orientation_factor numeric(4, 3),
  performance_ratio numeric(4, 3),
  avg_daily_irradiation numeric(6, 3),
  required_kwp numeric(8, 3),
  estimated_monthly_production_kwh numeric(10, 2),
  estimated_monthly_savings_cop numeric(12, 2),
  payback_years numeric(5, 2),

  -- Paso 4: presupuesto (congelado al generar, no se recalcula después)
  budget_breakdown jsonb,
  margin_pct numeric(5, 2),
  total_budget_cop numeric(14, 2),
  pdf_storage_path text,

  -- Gancho futuro hacia maran-energy (no usado todavía)
  external_project_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quotes enable row level security;

create policy "quotes_select_authenticated" on public.quotes
  for select to authenticated using (true);
create policy "quotes_insert_own" on public.quotes
  for insert to authenticated with check (created_by = auth.uid());
create policy "quotes_update_authenticated" on public.quotes
  for update to authenticated using (true);
create policy "quotes_delete_authenticated" on public.quotes
  for delete to authenticated using (true);

grant select, insert, update, delete on public.quotes to authenticated;
grant select, insert, update, delete on public.quotes to service_role;
