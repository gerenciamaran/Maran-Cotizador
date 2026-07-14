-- Permite dimensionar el sistema para más (o menos) del 100% del consumo
-- actual (ej. margen de crecimiento futuro, meta de autosuficiencia distinta).

alter table public.quotes
  add column target_coverage_pct numeric(5, 2) not null default 100;

alter table public.app_settings
  add column default_target_coverage_pct numeric(5, 2) not null default 100;
