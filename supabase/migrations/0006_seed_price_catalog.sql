-- Semilla del catálogo de precios a partir del modelo de costos real del
-- usuario (Colegio Los Andrés Barrancabermeja, sistema de 24 kWp).
--
-- El IVA (19%) ya está incluido en el costo por kWp de cada ítem que lo
-- lleva, EXCEPTO paneles e inversor (exentos de IVA en Colombia por la
-- Ley 1715 de 2014). Imprevistos/Administración/Corretajes se modelan como
-- ítems tipo "percent" sobre el subtotal; "Utilidad" (9%) se maneja como el
-- margen por defecto en app_settings, no como una fila del catálogo.
--
-- Nota: el total resultante puede variar ~1% frente al Excel original,
-- porque ese cálculo aplica cada recargo sobre una base ligeramente
-- distinta (ver conversación) — aprobado como aproximación aceptable.

insert into public.price_catalog (category, name, unit_type, unit_cost_cop, notes) values
  ('panel', 'Paneles solares 615W', 'per_kwp', 601666.67, 'Exento de IVA (Ley 1715 de 2014)'),
  ('inverter', 'Inversor 20kW Growatt', 'per_kwp', 354166.67, 'Exento de IVA (Ley 1715 de 2014)'),
  ('structure', 'Estructura', 'per_kwp', 170616.25, 'Incluye IVA (19%)'),
  ('other', 'Material eléctrico', 'per_kwp', 404600.00, 'Incluye IVA (19%)'),
  ('other', 'RETIE', 'per_kwp', 143791.67, 'Incluye IVA (19%)'),
  ('labor', 'Mano de obra', 'per_kwp', 452200.00, 'Incluye IVA (19%)'),
  ('other', 'Estudio de conexión', 'per_kwp', 347183.33, 'Incluye IVA (19%)'),
  ('other', 'Trámite ante el OR', 'per_kwp', 193375.00, 'Incluye IVA (19%)'),
  ('other', 'Diagrama e ingeniería', 'per_kwp', 208250.00, 'Incluye IVA (19%)'),
  ('other', 'UPME', 'per_kwp', 74375.00, 'Incluye IVA (19%)'),
  ('other', 'Medidor bidireccional', 'per_kwp', 84291.67, 'Incluye IVA (19%)'),
  ('other', 'Telecomunicador', 'per_kwp', 59500.00, 'Incluye IVA (19%)'),
  ('other', 'Smart meter', 'per_kwp', 64458.33, 'Incluye IVA (19%)'),
  ('other', 'Logística', 'per_kwp', 44625.00, 'Incluye IVA (19%)'),
  ('other', 'Imprevistos', 'percent', 6, 'Sobre el subtotal de todos los ítems anteriores'),
  ('other', 'Administración', 'percent', 8, 'Sobre el subtotal de todos los ítems anteriores'),
  ('other', 'Corretajes', 'percent', 5, 'Sobre el subtotal de todos los ítems anteriores');

update public.app_settings
set default_margin_pct = 9, -- "Utilidad" en el modelo original
    default_performance_ratio = 0.870
where id = 1;
