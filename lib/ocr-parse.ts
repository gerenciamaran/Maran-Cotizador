// Heurísticas para extraer consumo (kWh) y tarifa (COP/kWh) del texto plano
// que devuelve el OCR de una factura de energía. Función pura, sin
// dependencias externas — los formatos de factura varían mucho entre
// operadores en Colombia, así que esto es una extracción best-effort, nunca
// garantizada; el usuario siempre revisa/corrige antes de continuar.

export interface OcrExtraction {
  consumptionKwh: number | null;
  tariffCopPerKwh: number | null;
}

function parseColombianNumber(raw: string): number {
  // Formato colombiano: punto para miles, coma para decimales (1.234,56).
  // Si solo hay coma, se asume decimal; si solo hay punto y 3 dígitos
  // después, se asume separador de miles.
  const cleaned = raw.trim();
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }
  if (/\.\d{3}(\D|$)/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, ""));
  }
  return parseFloat(cleaned);
}

const NUMBER_PATTERN = "([\\d.,]+)";

function findFirstMatch(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = parseColombianNumber(match[1]);
      if (!isNaN(value) && value > 0) return value;
    }
  }
  return null;
}

export function parseOcrText(text: string): OcrExtraction {
  const normalized = text.replace(/\r/g, "");

  const consumptionKwh = findFirstMatch(normalized, [
    /consumo\s*facturado\D{0,15}(\d[\d.,]*)\s*kwh/i,
    /energ[íi]a\s*activa\D{0,15}(\d[\d.,]*)\s*kwh/i,
    /consumo\D{0,15}(\d[\d.,]*)\s*kwh/i,
    // Muchas facturas industriales/comerciales (tablas de consumo histórico)
    // ponen la unidad ANTES del número, y el OCR suele separarlos con saltos
    // de línea: "Energía activa kWh-mes\n271.516".
    /energ[íi]a\s*activa\s*kwh[-\s]*mes?[\s\S]{0,15}?(\d[\d.,]{2,})/i,
    /kwh[-\s]*mes[\s\S]{0,15}?(\d[\d.,]{2,})/i,
    new RegExp(NUMBER_PATTERN + "\\s*kwh", "i"),
  ]);

  const tariffCopPerKwh = findFirstMatch(normalized, [
    /costo\s*unitario\D{0,15}\$?\s*(\d[\d.,]*)/i,
    /tarifa\D{0,15}\$?\s*(\d[\d.,]*)\s*\/?\s*kwh/i,
    /valor\s*kwh\D{0,15}\$?\s*(\d[\d.,]*)/i,
    /\$\s*(\d[\d.,]*)\s*\/\s*kwh/i,
  ]);

  return { consumptionKwh, tariffCopPerKwh };
}
