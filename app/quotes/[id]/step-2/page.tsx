import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuoteById, requireProfile } from "@/lib/data";
import { WizardProgress } from "@/components/wizard-progress";
import { Card, CardTitle } from "@/components/ui";
import { ClientDataForm } from "@/app/quotes/[id]/step-2/client-data-form";

export default async function Step2Page({
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
      <Link href={`/quotes/${id}/step-1`} className="font-mono text-xs text-gray-500 hover:text-gray-700 underline mb-2.5 inline-block">
        ← Paso anterior
      </Link>
      <WizardProgress current={2} />
      <Card>
        <CardTitle>Datos del cliente</CardTitle>
        <ClientDataForm quote={quote} />
      </Card>
    </div>
  );
}
