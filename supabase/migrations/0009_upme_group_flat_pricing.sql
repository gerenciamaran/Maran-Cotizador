-- UPME / Medidor bidireccional / Telecomunicador / Smart meter en realidad
-- son precio fijo total (como RETIE), no tarifa por kWp — corrección del
-- usuario con los valores reales. Los tramos ya existentes (0-99kW base,
-- 99-1000kW +25%) siguen siendo válidos, solo cambia cómo los interpreta el
-- motor (tiered_flat = no se multiplica por kWp) y el valor base.

update public.price_catalog set unit_type = 'tiered_flat', unit_cost_cop = 1600000.00
where name = 'UPME';
update public.price_catalog set unit_type = 'tiered_flat', unit_cost_cop = 2000000.00
where name = 'Medidor bidireccional';
update public.price_catalog set unit_type = 'tiered_flat', unit_cost_cop = 1400000.00
where name = 'Telecomunicador';
update public.price_catalog set unit_type = 'tiered_flat', unit_cost_cop = 1500000.00
where name = 'Smart meter';
