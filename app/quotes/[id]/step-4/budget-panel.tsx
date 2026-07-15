"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { finalizeQuoteAction, generateBudgetAction } from "@/lib/actions/quotes";
import { Button, inputClass } from "@/components/ui";
import type { ProductSku, Quote } from "@/lib/supabase/types";

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

export function BudgetPanel({
  quote,
  panelOptions,
  inverterOptions,
}: {
  quote: Quote;
  panelOptions: ProductSku[];
  inverterOptions: ProductSku[];
}) {
  const [pending, startTransition] = useTransition();
  const [finalizing, startFinalizing] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [panelSkuId, setPanelSkuId] = useState(
    quote.panel_sku_id ?? panelOptions.find((s) => s.is_default)?.id ?? panelOptions[0]?.id ?? ""
  );
  const [inverterSkuId, setInverterSkuId] = useState(quote.inverter_sku_id ?? "");
  const router = useRouter();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("panel_sku_id", panelSkuId);
      formData.set("inverter_sku_id", inverterSkuId);
      const result = await generateBudgetAction(quote.id, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleFinalize() {
    startFinalizing(async () => {
      await finalizeQuoteAction(quote.id);
    });
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500 text-xs">Sistema</div>
          <div className="font-heading text-lg text-gray-900">
            {quote.required_kwp?.toFixed(2)} kWp
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500 text-xs">Ahorro mensual</div>
          <div className="font-heading text-lg text-gray-900">
            {quote.estimated_monthly_savings_cop
              ? formatCop(quote.estimated_monthly_savings_cop)
              : "—"}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500 text-xs">Retorno estimado</div>
          <div className="font-heading text-lg text-gray-900">
            {quote.payback_years ? `${quote.payback_years.toFixed(1)} años` : "—"}
          </div>
        </div>
      </div>

      {quote.budget_breakdown && quote.budget_breakdown.length > 0 ? (
        <div className="mb-4">
          <div className="divide-y divide-gray-100">
            {quote.budget_breakdown.map((line, i) => (
              <div key={i} className="flex justify-between items-center py-2 text-sm">
                <div>
                  <div className="font-semibold text-gray-900">{line.name}</div>
                  <div className="font-mono text-[11px] text-gray-500">
                    {CATEGORY_LABELS[line.category] ?? line.category}
                  </div>
                </div>
                <div className="text-gray-900">{formatCop(line.subtotal_cop)}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200">
            <div className="font-heading text-base text-gray-900">Total</div>
            <div className="font-heading text-xl text-blue-600">
              {quote.total_budget_cop ? formatCop(quote.total_budget_cop) : "—"}
            </div>
          </div>
        </div>
      ) : null}

      {(panelOptions.length > 0 || inverterOptions.length > 0) && (
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div>
            <label className="block font-mono text-[10px] uppercase text-gray-500 mb-1">
              Panel
            </label>
            <select
              value={panelSkuId}
              onChange={(e) => setPanelSkuId(e.target.value)}
              className={inputClass}
            >
              {panelOptions.map((sku) => (
                <option key={sku.id} value={sku.id}>
                  {sku.brand} {sku.model}
                  {sku.is_default ? " (predeterminado)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase text-gray-500 mb-1">
              Inversor
            </label>
            <select
              value={inverterSkuId}
              onChange={(e) => setInverterSkuId(e.target.value)}
              className={inputClass}
            >
              <option value="">Automático (25% del proyecto)</option>
              {inverterOptions.map((sku) => (
                <option key={sku.id} value={sku.id}>
                  {sku.brand} {sku.model}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      <div className="flex gap-2.5">
        <Button onClick={handleGenerate} disabled={pending}>
          {pending
            ? "Calculando…"
            : quote.total_budget_cop
            ? "Recalcular presupuesto"
            : "Generar presupuesto"}
        </Button>
        {quote.total_budget_cop && (
          <Button variant="outline" onClick={() => window.open(`/api/quotes/${quote.id}/pdf`, "_blank")}>
            Descargar PDF
          </Button>
        )}
        {quote.total_budget_cop && (
          <Button variant="success" onClick={handleFinalize} disabled={finalizing}>
            {finalizing ? "Finalizando…" : "Finalizar →"}
          </Button>
        )}
      </div>
    </div>
  );
}
