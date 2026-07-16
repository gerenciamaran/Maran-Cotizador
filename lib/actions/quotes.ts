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
import { getDefaultSku } from "@/lib/data";
import type { BudgetLine, PriceTier, ProductSku } from "@/lib/supabase/types";

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

export async function generateBudgetAction(
  quoteId: string,
  formData?: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const [
    { data: quote, error: quoteError },
    { data: catalog, error: catalogError },
    { data: settings },
    { data: tiers },
  ] = await Promise.all([
    supabase.from("quotes").select("*").eq("id", quoteId).single(),
    supabase.from("price_catalog").select("*").eq("is_active", true),
    supabase.from("app_settings").select("*").eq("id", 1).single(),
    supabase.from("price_tiers").select("*").order("band_order"),
  ]);

  if (quoteError || !quote) return { error: "No se encontró la cotización." };
  if (catalogError || !catalog || catalog.length === 0) {
    return { error: "El catálogo de precios está vacío. Agrega ítems primero." };
  }
  if (!quote.required_kwp) {
    return { error: "Falta calcular el dimensionamiento (paso 3)." };
  }

  const tiersByItemId: Record<string, PriceTier[]> = {};
  for (const tier of tiers ?? []) {
    (tiersByItemId[tier.price_catalog_id] ??= []).push(tier);
  }

  const panelSkuId = String(formData?.get("panel_sku_id") || "") || null;
  const inverterSkuId = String(formData?.get("inverter_sku_id") || "") || null;

  let panelSku: ProductSku | null;
  let inverterSku: ProductSku | null;
  if (panelSkuId) {
    ({ data: panelSku } = await supabase.from("product_skus").select("*").eq("id", panelSkuId).single());
  } else {
    panelSku = await getDefaultSku("panel");
  }
  if (inverterSkuId) {
    ({ data: inverterSku } = await supabase.from("product_skus").select("*").eq("id", inverterSkuId).single());
  } else {
    // Sin modelo elegido, el inversor se calcula automáticamente (25% del
    // resto del proyecto) en computeBudget — no se usa un SKU predeterminado.
    inverterSku = null;
  }

  const marginPct = settings?.default_margin_pct ?? 25;
  const budget = computeBudget(quote.required_kwp, catalog, marginPct, tiersByItemId, panelSku, inverterSku);
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
      panel_sku_id: panelSku?.id ?? null,
      inverter_sku_id: inverterSku?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) return { error: error.message };

  revalidatePath(`/quotes/${quoteId}/step-4`);
  return { error: null };
}

// Guarda un desglose de presupuesto editado a mano (el vendedor quitó,
// modificó o agregó ítems en la hoja final) y recalcula el total aplicando
// el mismo % de margen que ya tenía la cotización.
export async function updateBudgetBreakdownAction(
  quoteId: string,
  breakdown: BudgetLine[]
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("margin_pct, estimated_monthly_savings_cop")
    .eq("id", quoteId)
    .single();

  if (quoteError || !quote) return { error: "No se encontró la cotización." };

  const marginPct = quote.margin_pct ?? 0;
  const subtotalBeforeMargin = roundToPeso(breakdown.reduce((sum, l) => sum + l.subtotal_cop, 0));
  const total = roundToPeso(subtotalBeforeMargin * (1 + marginPct / 100));
  const paybackYears = computePaybackYears(total, quote.estimated_monthly_savings_cop ?? 0);

  const { error } = await supabase
    .from("quotes")
    .update({
      budget_breakdown: breakdown,
      total_budget_cop: total,
      payback_years: paybackYears,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) return { error: error.message };

  revalidatePath(`/quotes/${quoteId}/step-4`);
  return { error: null };
}

function roundToPeso(n: number): number {
  return Math.round(n);
}

export async function deleteQuoteAction(quoteId: string) {
  const supabase = await createClient();
  await supabase.from("quotes").delete().eq("id", quoteId);
  revalidatePath("/quotes");
}

export async function finalizeQuoteAction(quoteId: string) {
  const supabase = await createClient();
  await supabase
    .from("quotes")
    .update({ status: "sent", updated_at: new Date().toISOString() })
    .eq("id", quoteId);

  redirect("/quotes");
}
