// Irradiación solar promedio anual desde la API pública de NASA POWER
// (climatología mensual, sin necesidad de API key).

const NASA_POWER_URL =
  "https://power.larc.nasa.gov/api/temporal/climatology/point" +
  "?parameters=ALLSKY_SFC_SW_DWN&community=RE&format=JSON";

interface NasaPowerResponse {
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN: Record<string, number>;
    };
  };
}

// La respuesta trae 12 valores mensuales (claves "1".."12") más un "13" que
// es el promedio anual ya calculado por NASA — lo usamos directo si viene.
export async function fetchAnnualAverageIrradiation(
  latitude: number,
  longitude: number
): Promise<number> {
  const url = `${NASA_POWER_URL}&longitude=${longitude}&latitude=${latitude}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`NASA POWER respondió ${res.status}`);
  }
  const data: NasaPowerResponse = await res.json();
  const monthly = data.properties?.parameter?.ALLSKY_SFC_SW_DWN;
  if (!monthly) {
    throw new Error("NASA POWER no devolvió datos de irradiación para esta ubicación.");
  }

  if (typeof monthly["13"] === "number") {
    return monthly["13"];
  }

  const values = Array.from({ length: 12 }, (_, i) => monthly[String(i + 1)]).filter(
    (v): v is number => typeof v === "number"
  );
  if (values.length === 0) {
    throw new Error("NASA POWER no devolvió datos de irradiación para esta ubicación.");
  }
  return values.reduce((a, b) => a + b, 0) / values.length;
}
