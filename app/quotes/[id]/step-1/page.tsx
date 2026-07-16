import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuoteById, requireProfile } from "@/lib/data";
import { WizardProgress } from "@/components/wizard-progress";
import { Card, CardTitle } from "@/components/ui";
import { Step1Client } from "@/app/quotes/[id]/step-1/step1-client";

// OCR.space puede tardar bastante con OCREngine 2 en imágenes grandes; el
// límite por defecto de las funciones serverless (10s) se queda corto y
// mata la función a medias, lo que el cliente ve como un error genérico.
export const maxDuration = 60;

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
          Sube una foto de la factura para extraer el consumo y la tarifa automáticamente,
          o escríbelos a mano. Siempre revisa que los valores sean correctos antes de
          continuar.
        </p>
        <Step1Client
          quoteId={quote.id}
          initialConsumption={quote.monthly_consumption_kwh}
          initialTariff={quote.tariff_cop_per_kwh}
        />
      </Card>
    </div>
  );
}
