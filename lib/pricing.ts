// Cálculo de presupuesto a partir del catálogo de precios. Función pura: sin
// dependencias de Supabase/Next, fácil de probar aislada.

import type { BudgetLine, PriceCatalogItem, PriceTier, ProductSku } from "@/lib/supabase/types";

// Cuando no se elige un modelo de inversor específico, el modo automático
// calcula su costo como este % del resto del proyecto (sin utilidad) —
// confirmado con el usuario como una aproximación razonable del costo real.
const INVERTER_AUTO_PCT = 25;

export interface BudgetResult {
  breakdown: BudgetLine[];
  subtotalBeforeMargin: number;
  marginPct: number;
  total: number;
}

// Resuelve el valor de un ítem con precio escalonado: cada tramo aplica su
// % de incremento sobre el valor ya incrementado del tramo anterior (interés
// compuesto), no sobre la base original. Devuelve el valor del tramo cuyo
// [min_kwp, max_kwp] contiene a requiredKwp (si excede el último tramo, se
// usa el valor de ese último tramo).
export function resolveTieredValue(
  baseUnitCost: number,
  tiers: PriceTier[],
  requiredKwp: number
): number {
  const sorted = [...tiers].sort((a, b) => a.band_order - b.band_order);
  let value = baseUnitCost;

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    value = i === 0 ? baseUnitCost : value * (1 + tier.multiplier_pct / 100);
    const inBand = requiredKwp >= tier.min_kwp && (tier.max_kwp === null || requiredKwp <= tier.max_kwp);
    if (inBand) return value;
  }

  return value; // requiredKwp excede el último tramo: se usa su valor
}

export function computeBudget(
  requiredKwp: number,
  catalog: PriceCatalogItem[],
  marginPct: number,
  tiersByItemId: Record<string, PriceTier[]> = {},
  panelSku?: ProductSku | null,
  inverterSku?: ProductSku | null
): BudgetResult {
  // panel/inverter se manejan exclusivamente vía SKU (panelSku/inverterSku);
  // cualquier fila con esa categoría en price_catalog se ignora aquí para
  // evitar sumar el costo del equipo dos veces.
  const activeItems = catalog.filter(
    (item) => item.is_active && item.category !== "panel" && item.category !== "inverter"
  );

  // Los ítems "percent" (ej. contingencia) se aplican sobre el subtotal de
  // los demás ítems, así que se calculan en una segunda pasada.
  const baseItems = activeItems.filter((item) => item.unit_type !== "percent");
  const percentItems = activeItems.filter((item) => item.unit_type === "percent");

  const baseLines: BudgetLine[] = baseItems.map((item) => {
    const subtotal =
      item.unit_type === "per_wp"
        ? item.unit_cost_cop * requiredKwp * 1000
        : item.unit_type === "per_kwp"
        ? item.unit_cost_cop * requiredKwp
        : item.unit_type === "tiered_flat"
        ? resolveTieredValue(item.unit_cost_cop, tiersByItemId[item.id] ?? [], requiredKwp)
        : item.unit_type === "tiered_rate"
        ? resolveTieredValue(item.unit_cost_cop, tiersByItemId[item.id] ?? [], requiredKwp) * requiredKwp
        : item.unit_cost_cop; // flat
    return {
      category: item.category,
      name: item.name,
      unit_type: item.unit_type,
      unit_cost_cop: item.unit_cost_cop,
      subtotal_cop: round2(subtotal),
    };
  });

  if (panelSku) {
    const subtotal =
      panelSku.unit_type === "per_wp"
        ? panelSku.unit_cost_cop * requiredKwp * 1000
        : panelSku.unit_cost_cop * requiredKwp;
    baseLines.push({
      category: panelSku.category,
      name: `${panelSku.brand} ${panelSku.model}`,
      unit_type: panelSku.unit_type,
      unit_cost_cop: panelSku.unit_cost_cop,
      subtotal_cop: round2(subtotal),
    });
  }

  // Sin un modelo de inversor elegido explícitamente, el modo automático
  // calcula su costo como el 25% del resto del proyecto (sin utilidad),
  // en vez de usar la tarifa de un SKU predeterminado.
  if (inverterSku) {
    const subtotal =
      inverterSku.unit_type === "per_wp"
        ? inverterSku.unit_cost_cop * requiredKwp * 1000
        : inverterSku.unit_cost_cop * requiredKwp;
    baseLines.push({
      category: inverterSku.category,
      name: `${inverterSku.brand} ${inverterSku.model}`,
      unit_type: inverterSku.unit_type,
      unit_cost_cop: inverterSku.unit_cost_cop,
      subtotal_cop: round2(subtotal),
    });
  } else {
    const restOfProjectSubtotal = baseLines.reduce((sum, l) => sum + l.subtotal_cop, 0);
    baseLines.push({
      category: "inverter",
      name: "Inversor (automático — 25% del proyecto)",
      unit_type: "percent",
      unit_cost_cop: INVERTER_AUTO_PCT,
      subtotal_cop: round2(restOfProjectSubtotal * (INVERTER_AUTO_PCT / 100)),
    });
  }

  const baseSubtotal = baseLines.reduce((sum, l) => sum + l.subtotal_cop, 0);

  const percentLines: BudgetLine[] = percentItems.map((item) => {
    const subtotal = (baseSubtotal * item.unit_cost_cop) / 100;
    return {
      category: item.category,
      name: item.name,
      unit_type: item.unit_type,
      unit_cost_cop: item.unit_cost_cop,
      subtotal_cop: round2(subtotal),
    };
  });

  const breakdown = [...baseLines, ...percentLines];
  const subtotalBeforeMargin = round2(
    breakdown.reduce((sum, l) => sum + l.subtotal_cop, 0)
  );
  const total = round2(subtotalBeforeMargin * (1 + marginPct / 100));

  return { breakdown, subtotalBeforeMargin, marginPct, total };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
