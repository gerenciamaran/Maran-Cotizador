import { createDraftQuoteAction } from "@/lib/actions/quotes";
import { Button, Card, CardTitle } from "@/components/ui";

export default function NewQuotePage() {
  return (
    <div className="max-w-[600px] mx-auto px-4 pt-6">
      <Card>
        <CardTitle>Nueva cotización</CardTitle>
        <p className="text-sm text-gray-500 mb-4">
          Vamos a crear una cotización en 4 pasos: consumo, datos del cliente, cálculo
          técnico y presupuesto. Puedes salir en cualquier momento y retomarla después.
        </p>
        <form action={createDraftQuoteAction}>
          <Button type="submit">Empezar →</Button>
        </form>
      </Card>
    </div>
  );
}
