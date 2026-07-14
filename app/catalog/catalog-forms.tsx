"use client";

import { useActionState, useTransition } from "react";
import {
  addCatalogItemAction,
  deleteCatalogItemAction,
  toggleCatalogItemAction,
  updateMarginAction,
  type ActionState,
} from "@/lib/actions/catalog";
import { Button, inputClass } from "@/components/ui";

const initial: ActionState = { error: null };

export function AddCatalogItemForm() {
  const [state, formAction, pending] = useActionState(addCatalogItemAction, initial);

  return (
    <form action={formAction} className="flex gap-2.5 flex-wrap items-start mt-3.5">
      <select name="category" className={`${inputClass} flex-1 min-w-[130px]`} defaultValue="panel">
        <option value="panel">Panel</option>
        <option value="inverter">Inversor</option>
        <option value="structure">Estructura</option>
        <option value="labor">Mano de obra</option>
        <option value="other">Otro</option>
      </select>
      <input
        name="name"
        placeholder="Nombre (ej: Panel monocristalino 550W)"
        className={`${inputClass} flex-1 min-w-[220px]`}
        required
      />
      <select name="unit_type" className={`${inputClass} flex-1 min-w-[130px]`} defaultValue="per_kwp">
        <option value="per_wp">Por Wp</option>
        <option value="per_kwp">Por kWp</option>
        <option value="flat">Fijo</option>
        <option value="percent">% del subtotal</option>
      </select>
      <input
        name="unit_cost_cop"
        type="number"
        step="0.01"
        min="0"
        placeholder="Costo (COP)"
        className={`${inputClass} flex-1 min-w-[140px]`}
        required
      />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Agregando…" : "Agregar ítem"}
      </Button>
      {state.error && <p className="text-danger text-sm w-full">{state.error}</p>}
    </form>
  );
}

export function ToggleCatalogItemButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => await toggleCatalogItemAction(id, !isActive))}
      className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition"
    >
      {isActive ? "Desactivar" : "Activar"}
    </button>
  );
}

export function DeleteCatalogItemButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => await deleteCatalogItemAction(id))}
      className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-danger/40 text-danger hover:bg-danger/5 disabled:opacity-50 cursor-pointer transition"
    >
      Eliminar
    </button>
  );
}

export function MarginForm({
  currentMargin,
  currentTargetCoveragePct,
}: {
  currentMargin: number;
  currentTargetCoveragePct: number;
}) {
  const [state, formAction, pending] = useActionState(updateMarginAction, initial);
  return (
    <form action={formAction} className="flex gap-2.5 items-start flex-wrap">
      <div>
        <label className="block font-mono text-[10px] uppercase text-gray-500 mb-1">
          Margen (%)
        </label>
        <input
          name="default_margin_pct"
          type="number"
          step="0.1"
          min="0"
          defaultValue={currentMargin}
          className={`${inputClass} max-w-[140px]`}
        />
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase text-gray-500 mb-1">
          Cobertura objetivo (%)
        </label>
        <input
          name="default_target_coverage_pct"
          type="number"
          step="1"
          min="10"
          defaultValue={currentTargetCoveragePct}
          className={`${inputClass} max-w-[140px]`}
        />
      </div>
      <Button type="submit" variant="outline" disabled={pending} className="mt-5">
        {pending ? "Guardando…" : "Guardar"}
      </Button>
      {state.message && <p className="text-success text-sm w-full">{state.message}</p>}
      {state.error && <p className="text-danger text-sm w-full">{state.error}</p>}
    </form>
  );
}
