"use client";

import { useActionState, useTransition } from "react";
import {
  addCatalogItemAction,
  addPriceTierAction,
  deleteCatalogItemAction,
  deletePriceTierAction,
  toggleCatalogItemAction,
  updateMarginAction,
  updatePriceTierAction,
  type ActionState,
} from "@/lib/actions/catalog";
import {
  addSkuAction,
  deleteSkuAction,
  setDefaultSkuAction,
  toggleSkuAction,
} from "@/lib/actions/skus";
import { Button, inputClass } from "@/components/ui";
import type { PriceTier } from "@/lib/supabase/types";

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
        <option value="tiered_flat">Escalonado — fijo por tramo</option>
        <option value="tiered_rate">Escalonado — tarifa por tramo</option>
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

export function AddSkuForm() {
  const [state, formAction, pending] = useActionState(addSkuAction, initial);

  return (
    <form action={formAction} className="flex gap-2.5 flex-wrap items-start mt-3.5">
      <select name="category" className={`${inputClass} flex-1 min-w-[120px]`} defaultValue="panel">
        <option value="panel">Panel</option>
        <option value="inverter">Inversor</option>
      </select>
      <input name="brand" placeholder="Marca" className={`${inputClass} flex-1 min-w-[140px]`} required />
      <input name="model" placeholder="Modelo" className={`${inputClass} flex-1 min-w-[140px]`} required />
      <input
        name="capacity_label"
        placeholder="Capacidad (ej: 615 Wp)"
        className={`${inputClass} flex-1 min-w-[140px]`}
      />
      <select name="unit_type" className={`${inputClass} flex-1 min-w-[110px]`} defaultValue="per_kwp">
        <option value="per_wp">Por Wp</option>
        <option value="per_kwp">Por kWp</option>
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
        {pending ? "Agregando…" : "Agregar modelo"}
      </Button>
      {state.error && <p className="text-danger text-sm w-full">{state.error}</p>}
    </form>
  );
}

export function ToggleSkuButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => await toggleSkuAction(id, !isActive))}
      className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition"
    >
      {isActive ? "Desactivar" : "Activar"}
    </button>
  );
}

export function DeleteSkuButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => await deleteSkuAction(id))}
      className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-danger/40 text-danger hover:bg-danger/5 disabled:opacity-50 cursor-pointer transition"
    >
      Eliminar
    </button>
  );
}

export function SetDefaultSkuButton({
  id,
  category,
  isDefault,
}: {
  id: string;
  category: "panel" | "inverter";
  isDefault: boolean;
}) {
  const [pending, startTransition] = useTransition();
  if (isDefault) {
    return (
      <span className="text-xs font-medium px-2.5 py-1.5 rounded-full bg-gray-900 text-white">
        Predeterminado
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => await setDefaultSkuAction(id, category))}
      className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-blue-300 text-blue-600 hover:bg-blue-50 disabled:opacity-50 cursor-pointer transition"
    >
      {pending ? "…" : "Marcar predeterminado"}
    </button>
  );
}

export function AddPriceTierForm({ priceCatalogId, nextBandOrder }: { priceCatalogId: string; nextBandOrder: number }) {
  const [state, formAction, pending] = useActionState(addPriceTierAction, initial);
  return (
    <form action={formAction} className="flex gap-2 flex-wrap items-start mt-2">
      <input type="hidden" name="price_catalog_id" value={priceCatalogId} />
      <input type="hidden" name="band_order" value={nextBandOrder} />
      <input name="min_kwp" type="number" step="0.01" min="0" placeholder="Mín kWp" className={`${inputClass} w-24`} required />
      <input name="max_kwp" type="number" step="0.01" min="0" placeholder="Máx kWp (vacío = sin límite)" className={`${inputClass} w-44`} />
      <input
        name="multiplier_pct"
        type="number"
        step="0.01"
        placeholder="% sobre tramo anterior"
        className={`${inputClass} w-44`}
        required
      />
      <Button type="submit" variant="outline" small disabled={pending}>
        {pending ? "Agregando…" : "Agregar tramo"}
      </Button>
      {state.error && <p className="text-danger text-sm w-full">{state.error}</p>}
    </form>
  );
}

export function PriceTierRow({ tier }: { tier: PriceTier }) {
  const [state, formAction, pending] = useActionState(updatePriceTierAction, initial);
  const [deleting, startDeleting] = useTransition();
  return (
    <form action={formAction} className="flex gap-2 items-center py-1.5 flex-wrap">
      <input type="hidden" name="id" value={tier.id} />
      <span className="font-mono text-[11px] text-gray-500 w-10">#{tier.band_order}</span>
      <input
        name="min_kwp"
        type="number"
        step="0.01"
        defaultValue={tier.min_kwp}
        className={`${inputClass} w-24`}
      />
      <input
        name="max_kwp"
        type="number"
        step="0.01"
        defaultValue={tier.max_kwp ?? ""}
        placeholder="sin límite"
        className={`${inputClass} w-32`}
      />
      <input
        name="multiplier_pct"
        type="number"
        step="0.01"
        defaultValue={tier.multiplier_pct}
        className={`${inputClass} w-28`}
      />
      <span className="font-mono text-[11px] text-gray-500">%</span>
      <Button type="submit" variant="outline" small disabled={pending}>
        {pending ? "…" : "Guardar"}
      </Button>
      <button
        type="button"
        disabled={deleting}
        onClick={() => startDeleting(async () => await deletePriceTierAction(tier.id))}
        className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-danger/40 text-danger hover:bg-danger/5 disabled:opacity-50 cursor-pointer transition"
      >
        Eliminar
      </button>
      {state.error && <p className="text-danger text-sm w-full">{state.error}</p>}
    </form>
  );
}
