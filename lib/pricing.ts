// Cálculo de presupuesto a partir del catálogo de precios. Función pura: sin
// dependencias de Supabase/Next, fácil de probar aislada.

import type { BudgetLine, PriceCatalogItem, PriceTier, ProductSku } from "@/lib/supabase/types";

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
  const activeItems = catalog.filter((item) => item.is_active);

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

  for (const sku of [panelSku, inverterSku]) {
    if (!sku) continue;
    const subtotal = sku.unit_type === "per_wp" ? sku.unit_cost_cop * requiredKwp * 1000 : sku.unit_cost_cop * requiredKwp;
    baseLines.push({
      category: sku.category,
      name: `${sku.brand} ${sku.model}`,
      unit_type: sku.unit_type,
      unit_cost_cop: sku.unit_cost_cop,
      subtotal_cop: round2(subtotal),
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
