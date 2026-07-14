"use client";

import { useActionState } from "react";
import { calculateSizingAction, type ActionState } from "@/lib/actions/quotes";
import { Button, FieldLabel, inputClass } from "@/components/ui";
import { ORIENTATION_FACTORS, ORIENTATION_LABELS, type OrientationOption } from "@/lib/sizing";
import type { Quote } from "@/lib/supabase/types";

const initialState: ActionState = { error: null };

function orientationFromFactor(factor: number | null): OrientationOption {
  const match = (Object.entries(ORIENTATION_FACTORS) as [OrientationOption, number][]).find(
    ([, value]) => value === factor
  );
  return match?.[0] ?? "buena";
}

export function SizingForm({
  quote,
  defaultPerformanceRatio,
}: {
  quote: Quote;
  defaultPerformanceRatio: number;
}) {
  const [state, formAction, pending] = useActionState(calculateSizingAction, initialState);
  const alreadyCalculated = quote.required_kwp !== null;

  return (
    <form action={formAction}>
      <input type="hidden" name="quote_id" value={quote.id} />

      <FieldLabel>Orientación / sombra del techo</FieldLabel>
      <select
        name="orientation"
        className={inputClass}
        defaultValue={orientationFromFactor(quote.orientation_factor)}
      >
        {(Object.entries(ORIENTATION_LABELS) as [OrientationOption, string][]).map(
          ([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          )
        )}
      </select>

      <FieldLabel>Performance ratio (pérdidas del sistema)</FieldLabel>
      <input
        name="performance_ratio"
        type="number"
        step="0.01"
        min="0.1"
        max="1"
        defaultValue={quote.performance_ratio ?? defaultPerformanceRatio}
        className={inputClass}
      />

      {state.error && <p className="text-danger text-sm mt-2">{state.error}</p>}

      {alreadyCalculated && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500 text-xs">Tamaño del sistema</div>
            <div className="font-heading text-lg text-gray-900">
              {quote.required_kwp?.toFixed(2)} kWp
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-500 text-xs">Producción mensual estimada</div>
            <div className="font-heading text-lg text-gray-900">
              {quote.estimated_monthly_production_kwh?.toFixed(0)} kWh
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Calculando…" : alreadyCalculated ? "Recalcular →" : "Calcular →"}
        </Button>
      </div>
    </form>
  );
}
