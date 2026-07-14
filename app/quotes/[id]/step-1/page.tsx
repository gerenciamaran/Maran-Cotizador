import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuoteById, requireProfile } from "@/lib/data";
import { WizardProgress } from "@/components/wizard-progress";
import { Card, CardTitle } from "@/components/ui";
import { ConsumptionForm } from "@/app/quotes/[id]/step-1/consumption-form";

export default async function Step1Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote) notFound();

  return (
    <div className="max-w-[600px] mx-auto px-4 pt-6">
      <Link href="/quotes" className="font-mono text-xs text-gray-500 hover:text-gray-700 underline mb-2.5 inline-block">
        ← Volver a cotizaciones
      </Link>
      <WizardProgress current={1} />
      <Card>
        <CardTitle>Consumo de energía</CardTitle>
        <p className="text-sm text-gray-500 mb-4">
          Ingresa el consumo mensual y la tarifa del cliente (los encuentras en su
          factura de energía). Más adelante esto se podrá extraer automáticamente de
          una foto de la factura.
        </p>
        <ConsumptionForm
          quoteId={quote.id}
          initialConsumption={quote.monthly_consumption_kwh}
          initialTariff={quote.tariff_cop_per_kwh}
        />
      </Card>
    </div>
  );
}
