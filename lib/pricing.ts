// Cálculo de presupuesto a partir del catálogo de precios. Función pura: sin
// dependencias de Supabase/Next, fácil de probar aislada.

import type { BudgetLine, PriceCatalogItem } from "@/lib/supabase/types";

export interface BudgetResult {
  breakdown: BudgetLine[];
  subtotalBeforeMargin: number;
  marginPct: number;
  total: number;
}

export function computeBudget(
  requiredKwp: number,
  catalog: PriceCatalogItem[],
  marginPct: number
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
        : item.unit_cost_cop; // flat
    return {
      category: item.category,
      name: item.name,
      unit_type: item.unit_type,
      unit_cost_cop: item.unit_cost_cop,
      subtotal_cop: round2(subtotal),
    };
  });

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
