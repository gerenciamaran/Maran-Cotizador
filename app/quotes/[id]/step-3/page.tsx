import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppSettings, getQuoteById, requireProfile } from "@/lib/data";
import { WizardProgress } from "@/components/wizard-progress";
import { Card, CardTitle, Empty } from "@/components/ui";
import { SizingForm } from "@/app/quotes/[id]/step-3/sizing-form";

export default async function Step3Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;
  const [quote, settings] = await Promise.all([getQuoteById(id), getAppSettings()]);
  if (!quote) notFound();

  return (
    <div className="max-w-[600px] mx-auto px-4 pt-6">
      <Link href={`/quotes/${id}/step-2`} className="font-mono text-xs text-gray-500 hover:text-gray-700 underline mb-2.5 inline-block">
        ← Paso anterior
      </Link>
      <WizardProgress current={3} />
      <Card>
        <CardTitle>Cálculo del sistema</CardTitle>
        {!quote.latitude || !quote.longitude || !quote.monthly_consumption_kwh ? (
          <Empty>
            Faltan datos de los pasos anteriores (consumo o ubicación). Vuelve atrás y
            complétalos primero.
          </Empty>
        ) : (
          <SizingForm
            quote={quote}
            defaultPerformanceRatio={settings.default_performance_ratio}
          />
        )}
      </Card>
    </div>
  );
}
