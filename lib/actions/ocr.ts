"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/data";
import { parseOcrText } from "@/lib/ocr-parse";

export type OcrState = {
  error: string | null;
  consumptionKwh?: number | null;
  tariffCopPerKwh?: number | null;
};

const OCR_SPACE_URL = "https://apipro1.ocr.space/parse/image";

export async function runOcrAction(
  _prevState: OcrState,
  formData: FormData
): Promise<OcrState> {
  await requireProfile();
  const quoteId = String(formData.get("quote_id") || "");
  const file = formData.get("bill_image");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una foto o PDF de la factura." };
  }

  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    return { error: "El OCR todavía no está configurado (falta la API key)." };
  }

  const supabase = await createClient();

  const ext = file.name.split(".").pop() || "jpg";
  const storagePath = `${quoteId}/factura.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("bill-images")
    .upload(storagePath, file, { upsert: true, contentType: file.type || "image/jpeg" });

  if (uploadError) {
    return { error: `No se pudo subir la imagen: ${uploadError.message}` };
  }

  const ocrForm = new FormData();
  ocrForm.append("apikey", apiKey);
  ocrForm.append("language", "spa");
  ocrForm.append("OCREngine", "2");
  ocrForm.append("file", file, file.name);

  let ocrText = "";
  try {
    const res = await fetch(OCR_SPACE_URL, { method: "POST", body: ocrForm });
    const json = await res.json();
    if (json.IsErroredOnProcessing) {
      return {
        error: `El OCR no pudo procesar la imagen: ${json.ErrorMessage?.[0] ?? "error desconocido"}`,
      };
    }
    ocrText = json.ParsedResults?.[0]?.ParsedText ?? "";
  } catch (err) {
    return {
      error: err instanceof Error ? `Error llamando al OCR: ${err.message}` : "Error llamando al OCR.",
    };
  }

  const extraction = parseOcrText(ocrText);

  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      bill_image_path: storagePath,
      ocr_raw_text: ocrText,
      monthly_consumption_kwh: extraction.consumptionKwh,
      tariff_cop_per_kwh: extraction.tariffCopPerKwh,
      ocr_confidence: "auto",
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (updateError) return { error: updateError.message };

  if (!extraction.consumptionKwh && !extraction.tariffCopPerKwh) {
    return {
      error:
        "No se pudo extraer el consumo ni la tarifa automáticamente. Escribe los valores a mano abajo.",
    };
  }

  return {
    error: null,
    consumptionKwh: extraction.consumptionKwh,
    tariffCopPerKwh: extraction.tariffCopPerKwh,
  };
}
