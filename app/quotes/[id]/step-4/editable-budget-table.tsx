"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBudgetBreakdownAction } from "@/lib/actions/quotes";
import { Button, inputClass } from "@/components/ui";
import type { BudgetLine, PriceCategory } from "@/lib/supabase/types";

const CATEGORY_LABELS: Record<string, string> = {
  panel: "Paneles",
  inverter: "Inversor",
  structure: "Estructura",
  labor: "Mano de obra",
  other: "Otros",
};

function formatCop(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function EditableBudgetTable({
  quoteId,
  initialBreakdown,
  marginPct,
}: {
  quoteId: string;
  initialBreakdown: BudgetLine[];
  marginPct: number;
}) {
  const [lines, setLines] = useState<BudgetLine[]>(initialBreakdown);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const router = useRouter();

  const subtotalBeforeMargin = lines.reduce((sum, l) => sum + l.subtotal_cop, 0);
  const total = subtotalBeforeMargin * (1 + marginPct / 100);

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAmount(index: number, value: string) {
    const amount = Number(value);
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, subtotal_cop: isNaN(amount) ? 0 : amount } : l))
    );
  }

  function addLine() {
    const amount = Number(newAmount);
    if (!newName.trim() || !newAmount || isNaN(amount)) return;
    setLines((prev) => [
      ...prev,
      {
        category: "other" as PriceCategory,
        name: newName.trim(),
        unit_type: "flat",
        unit_cost_cop: amount,
        subtotal_cop: amount,
      },
    ]);
    setNewName("");
    setNewAmount("");
  }

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await updateBudgetBreakdownAction(quoteId, lines);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mb-4">
      <div className="divide-y divide-gray-100">
        {lines.map((line, i) => (
          <div key={i} className="py-2 text-sm">
            <div className="mb-1.5">
              <div className="font-semibold text-gray-900">{line.name}</div>
              <div className="font-mono text-[11px] text-gray-500">
                {CATEGORY_LABELS[line.category] ?? line.category}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={line.subtotal_cop}
                onChange={(e) => updateAmount(i, e.target.value)}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-danger/40 text-danger hover:bg-danger/5 cursor-pointer transition shrink-0"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center py-2.5 flex-wrap">
        <input
          placeholder="Nombre del ítem nuevo"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={`${inputClass} flex-1 min-w-[160px]`}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Valor (COP)"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          className={`${inputClass} w-36`}
        />
        <Button type="button" variant="outline" small onClick={addLine}>
          + Agregar ítem
        </Button>
      </div>

      <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200 text-sm text-gray-500">
        <div>Subtotal (sin utilidad)</div>
        <div>{formatCop(subtotalBeforeMargin)}</div>
      </div>
      <div className="flex justify-between items-center pt-1">
        <div className="font-heading text-base text-gray-900">Total ({marginPct}% utilidad)</div>
        <div className="font-heading text-xl text-blue-600">{formatCop(total)}</div>
      </div>

      {error && <p className="text-danger text-sm mt-2">{error}</p>}

      <div className="mt-3">
        <Button variant="success" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando…" : "Guardar presupuesto editado"}
        </Button>
      </div>
    </div>
  );
}
