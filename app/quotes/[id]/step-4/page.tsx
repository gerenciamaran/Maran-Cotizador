import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveSkus, getQuoteById, requireProfile } from "@/lib/data";
import { WizardProgress } from "@/components/wizard-progress";
import { Card, CardTitle, Empty } from "@/components/ui";
import { BudgetPanel } from "@/app/quotes/[id]/step-4/budget-panel";

export default async function Step4Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;
  const [quote, skus] = await Promise.all([getQuoteById(id), getActiveSkus()]);
  if (!quote) notFound();

  return (
    <div className="max-w-[600px] mx-auto px-4 pt-6">
      <Link href={`/quotes/${id}/step-3`} className="font-mono text-xs text-gray-500 hover:text-gray-700 underline mb-2.5 inline-block">
        ← Paso anterior
      </Link>
      <WizardProgress current={4} />
      <Card>
        <CardTitle>Presupuesto</CardTitle>
        {!quote.required_kwp ? (
          <Empty>Falta calcular el dimensionamiento del sistema (paso 3).</Empty>
        ) : (
          <BudgetPanel
            quote={quote}
            panelOptions={skus.filter((s) => s.category === "panel")}
            inverterOptions={skus.filter((s) => s.category === "inverter")}
          />
        )}
      </Card>
    </div>
  );
}
