"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/data";
import { fetchAnnualAverageIrradiation } from "@/lib/nasa-power";
import {
  computeSizing,
  computePaybackYears,
  ORIENTATION_FACTORS,
  type OrientationOption,
} from "@/lib/sizing";
import { computeBudget } from "@/lib/pricing";

export type ActionState = { error: string | null; message?: string | null };

export async function createDraftQuoteAction() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .insert({ created_by: profile.id })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear la cotización.");
  }

  redirect(`/quotes/${data.id}/step-1`);
}

export async function updateConsumptionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const quoteId = String(formData.get("quote_id") || "");
  const monthlyConsumption = Number(formData.get("monthly_consumption_kwh"));
  const tariff = Number(formData.get("tariff_cop_per_kwh"));

  if (!monthlyConsumption || monthlyConsumption <= 0) {
    return { error: "Ingresa un consumo mensual válido." };
  }
  if (!tariff || tariff <= 0) {
    return { error: "Ingresa una tarifa válida." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("quotes")
    .select("bill_image_path")
    .eq("id", quoteId)
    .single();

  const { error } = await supabase
    .from("quotes")
    .update({
      monthly_consumption_kwh: monthlyConsumption,
      tariff_cop_per_kwh: tariff,
      // Si ya se subió una factura y se corrió OCR sobre ella, este envío es
      // la revisión humana del dato extraído (se haya editado o no); si nunca
      // hubo OCR, es una entrada 100% manual.
      ocr_confidence: existing?.bill_image_path ? "user_corrected" : "manual",
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) return { error: error.message };

  redirect(`/quotes/${quoteId}/step-2`);
}

export async function updateClientDataAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const quoteId = String(formData.get("quote_id") || "");
  const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : null;
  const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : null;

  if (latitude === null || longitude === null) {
    return { error: "Marca la ubicación del sitio en el mapa." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({
      client_company_name: String(formData.get("client_company_name") || "") || null,
      client_nit: String(formData.get("client_nit") || "") || null,
      client_contact_name: String(formData.get("client_contact_name") || "") || null,
      client_contact_email: String(formData.get("client_contact_email") || "") || null,
      client_contact_phone: String(formData.get("client_contact_phone") || "") || null,
      address: String(formData.get("address") || "") || null,
      latitude,
      longitude,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) return { error: error.message };

  redirect(`/quotes/${quoteId}/step-3`);
}

export async function calculateSizingAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const quoteId = String(formData.get("quote_id") || "");
  const orientation = String(formData.get("orientation") || "buena") as OrientationOption;
  const performanceRatio = Number(formData.get("performance_ratio"));
  const targetCoveragePct = Number(formData.get("target_coverage_pct")) || 100;

  const supabase = await createClient();
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (quoteError || !quote) return { error: "No se encontró la cotización." };
  if (!quote.latitude || !quote.longitude) {
    return { error: "Falta la ubicación del sitio (paso 2)." };
  }
  if (!quote.monthly_consumption_kwh || !quote.tariff_cop_per_kwh) {
    return { error: "Falta el consumo y la tarifa (paso 1)." };
  }

  let avgDailyIrradiation: number;
  try {
    avgDailyIrradiation = await fetchAnnualAverageIrradiation(quote.latitude, quote.longitude);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `No se pudo obtener la irradiación solar: ${err.message}`
          : "No se pudo obtener la irradiación solar.",
    };
  }

  const orientationFactor = ORIENTATION_FACTORS[orientation] ?? ORIENTATION_FACTORS.buena;

  const sizing = computeSizing({
    monthlyConsumptionKwh: quote.monthly_consumption_kwh,
    tariffCopPerKwh: quote.tariff_cop_per_kwh,
    avgDailyIrradiation,
    performanceRatio,
    orientationFactor,
    targetCoveragePct,
  });

  const { error } = await supabase
    .from("quotes")
    .update({
      orientation_factor: orientationFactor,
      performance_ratio: performanceRatio,
      target_coverage_pct: targetCoveragePct,
      avg_daily_irradiation: avgDailyIrradiation,
      required_kwp: sizing.requiredKwp,
      estimated_monthly_production_kwh: sizing.estimatedMonthlyProductionKwh,
      estimated_monthly_savings_cop: sizing.estimatedMonthlySavingsCop,
      status: "calculated",
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) return { error: error.message };

  redirect(`/quotes/${quoteId}/step-4`);
}

export async function generateBudgetAction(quoteId: string): Promise<ActionState> {
  const supabase = await createClient();

  const [{ data: quote, error: quoteError }, { data: catalog, error: catalogError }, { data: settings }] =
    await Promise.all([
      supabase.from("quotes").select("*").eq("id", quoteId).single(),
      supabase.from("price_catalog").select("*").eq("is_active", true),
      supabase.from("app_settings").select("*").eq("id", 1).single(),
    ]);

  if (quoteError || !quote) return { error: "No se encontró la cotización." };
  if (catalogError || !catalog || catalog.length === 0) {
    return { error: "El catálogo de precios está vacío. Agrega ítems primero." };
  }
  if (!quote.required_kwp) {
    return { error: "Falta calcular el dimensionamiento (paso 3)." };
  }

  const marginPct = settings?.default_margin_pct ?? 25;
  const budget = computeBudget(quote.required_kwp, catalog, marginPct);
  const paybackYears = computePaybackYears(
    budget.total,
    quote.estimated_monthly_savings_cop ?? 0
  );

  const { error } = await supabase
    .from("quotes")
    .update({
      budget_breakdown: budget.breakdown,
      margin_pct: budget.marginPct,
      total_budget_cop: budget.total,
      payback_years: paybackYears,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) return { error: error.message };

  revalidatePath(`/quotes/${quoteId}/step-4`);
  return { error: null };
}
