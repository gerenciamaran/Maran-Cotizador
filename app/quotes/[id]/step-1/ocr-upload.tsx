"use client";

import { useActionState } from "react";
import { runOcrAction, type OcrState } from "@/lib/actions/ocr";
import { Button } from "@/components/ui";

const initialState: OcrState = { error: null };

export function OcrUpload({
  quoteId,
  onExtracted,
}: {
  quoteId: string;
  onExtracted: (consumptionKwh: number | null, tariffCopPerKwh: number | null) => void;
}) {
  const [state, formAction, pending] = useActionState(async (prev: OcrState, formData: FormData) => {
    const result = await runOcrAction(prev, formData);
    if (!result.error || result.consumptionKwh || result.tariffCopPerKwh) {
      onExtracted(result.consumptionKwh ?? null, result.tariffCopPerKwh ?? null);
    }
    return result;
  }, initialState);

  return (
    <form action={formAction} className="mb-5 pb-5 border-b border-gray-100">
      <input type="hidden" name="quote_id" value={quoteId} />
      <label className="block font-mono text-[11px] uppercase text-gray-500 mb-1">
        Foto de la factura (opcional)
      </label>
      <div className="flex gap-2.5 flex-wrap items-center">
        <input
          type="file"
          name="bill_image"
          accept="image/*,application/pdf"
          className="text-sm text-gray-600 flex-1 min-w-[200px]"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Leyendo factura…" : "Extraer datos"}
        </Button>
      </div>
      {state.error && <p className="text-danger text-sm mt-2">{state.error}</p>}
      {!state.error && (state.consumptionKwh || state.tariffCopPerKwh) && (
        <p className="text-success text-sm mt-2">
          Datos extraídos automáticamente — verifica que sean correctos abajo antes de continuar.
        </p>
      )}
    </form>
  );
}
