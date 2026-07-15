"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { finalizeQuoteAction, generateBudgetAction } from "@/lib/actions/quotes";
import { Button } from "@/components/ui";
import type { Quote } from "@/lib/supabase/types";

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

export function BudgetPanel({ quote }: { quote: Quote }) {
  const [pending, startTransition] = useTransition();
  const [finalizing, startFinalizing] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateBudgetAction(quote.id);
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
