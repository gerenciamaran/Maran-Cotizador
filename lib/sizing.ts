// Fórmula de dimensionamiento solar. Función pura: sin dependencias de
// Supabase/Next, fácil de probar aislada (ver lib/sizing.test-manual.mjs).

export type OrientationOption = "optima" | "buena" | "sombra_parcial" | "mala";

export const ORIENTATION_FACTORS: Record<OrientationOption, number> = {
  optima: 1.0,
  buena: 0.95,
  sombra_parcial: 0.85,
  mala: 0.7,
};

export const ORIENTATION_LABELS: Record<OrientationOption, string> = {
  optima: "Óptima (techo despejado, orientación ideal)",
  buena: "Buena (leve sombra u orientación no ideal)",
  sombra_parcial: "Sombra parcial en parte del día",
  mala: "Mala (sombra significativa u orientación desfavorable)",
};

const DAYS_PER_MONTH = 30;

export interface SizingInput {
  monthlyConsumptionKwh: number;
  tariffCopPerKwh: number;
  avgDailyIrradiation: number; // kWh/m²/día, de NASA POWER
  performanceRatio: number; // 0-1
  orientationFactor: number; // 0-1
}

export interface SizingResult {
  requiredKwp: number;
  estimatedMonthlyProductionKwh: number;
  estimatedMonthlySavingsCop: number;
}

export function computeSizing(input: SizingInput): SizingResult {
  const {
    monthlyConsumptionKwh,
    tariffCopPerKwh,
    avgDailyIrradiation,
    performanceRatio,
    orientationFactor,
  } = input;

  const dailyYieldPerKwp = avgDailyIrradiation * performanceRatio * orientationFactor;
  const requiredKwp =
    dailyYieldPerKwp > 0
      ? monthlyConsumptionKwh / (dailyYieldPerKwp * DAYS_PER_MONTH)
      : 0;
  const estimatedMonthlyProductionKwh = requiredKwp * dailyYieldPerKwp * DAYS_PER_MONTH;
  const estimatedMonthlySavingsCop =
    Math.min(estimatedMonthlyProductionKwh, monthlyConsumptionKwh) * tariffCopPerKwh;

  return {
    requiredKwp,
    estimatedMonthlyProductionKwh,
    estimatedMonthlySavingsCop,
  };
}

export function computePaybackYears(
  totalBudgetCop: number,
  estimatedMonthlySavingsCop: number
): number | null {
  if (estimatedMonthlySavingsCop <= 0) return null;
  return totalBudgetCop / (estimatedMonthlySavingsCop * 12);
}
