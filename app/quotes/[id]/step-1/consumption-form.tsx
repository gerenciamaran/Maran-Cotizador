"use client";

import { useActionState } from "react";
import { updateConsumptionAction, type ActionState } from "@/lib/actions/quotes";
import { Button, FieldLabel, inputClass } from "@/components/ui";

const initialState: ActionState = { error: null };

export function ConsumptionForm({
  quoteId,
  initialConsumption,
  initialTariff,
}: {
  quoteId: string;
  initialConsumption: number | null;
  initialTariff: number | null;
}) {
  const [state, formAction, pending] = useActionState(updateConsumptionAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="quote_id" value={quoteId} />

      <FieldLabel>Consumo mensual (kWh)</FieldLabel>
      <input
        name="monthly_consumption_kwh"
        type="number"
        step="0.01"
        min="0"
        defaultValue={initialConsumption ?? ""}
        className={inputClass}
        placeholder="Ej: 600"
        required
      />

      <FieldLabel>Tarifa (COP por kWh)</FieldLabel>
      <input
        name="tariff_cop_per_kwh"
        type="number"
        step="0.01"
        min="0"
        defaultValue={initialTariff ?? ""}
        className={inputClass}
        placeholder="Ej: 850"
        required
      />

      {state.error && <p className="text-danger text-sm mt-2">{state.error}</p>}

      <div className="mt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Siguiente →"}
        </Button>
      </div>
    </form>
  );
}
