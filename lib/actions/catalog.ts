"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/data";
import type { PriceCategory, PriceUnitType } from "@/lib/supabase/types";

export type ActionState = { error: string | null; message?: string | null };

export async function addCatalogItemAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireAdminProfile();
  const category = String(formData.get("category") || "") as PriceCategory;
  const name = String(formData.get("name") || "").trim();
  const unitType = String(formData.get("unit_type") || "") as PriceUnitType;
  const unitCost = Number(formData.get("unit_cost_cop"));

  if (!name) return { error: "Escribe un nombre para el ítem." };
  if (!unitCost || unitCost <= 0) return { error: "Ingresa un costo válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("price_catalog").insert({
    category,
    name,
    unit_type: unitType,
    unit_cost_cop: unitCost,
    updated_by: profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/catalog");
  return { error: null };
}

export async function toggleCatalogItemAction(id: string, isActive: boolean) {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  await supabase
    .from("price_catalog")
    .update({ is_active: isActive, updated_by: profile.id, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/catalog");
}

export async function deleteCatalogItemAction(id: string) {
  await requireAdminProfile();
  const supabase = await createClient();
  await supabase.from("price_catalog").delete().eq("id", id);
  revalidatePath("/catalog");
}

export async function addPriceTierAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminProfile();
  const priceCatalogId = String(formData.get("price_catalog_id") || "");
  const bandOrder = Number(formData.get("band_order"));
  const minKwp = Number(formData.get("min_kwp"));
  const maxKwpRaw = String(formData.get("max_kwp") || "").trim();
  const multiplierPct = Number(formData.get("multiplier_pct"));

  if (!priceCatalogId) return { error: "Falta el ítem del catálogo." };
  if (isNaN(bandOrder) || bandOrder < 0) return { error: "Ingresa un orden de tramo válido." };
  if (isNaN(minKwp) || minKwp < 0) return { error: "Ingresa un mínimo de kWp válido." };
  if (isNaN(multiplierPct)) return { error: "Ingresa un porcentaje válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("price_tiers").insert({
    price_catalog_id: priceCatalogId,
    band_order: bandOrder,
    min_kwp: minKwp,
    max_kwp: maxKwpRaw ? Number(maxKwpRaw) : null,
    multiplier_pct: multiplierPct,
  });

  if (error) return { error: error.message };

  revalidatePath("/catalog");
  return { error: null };
}

export async function updatePriceTierAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminProfile();
  const id = String(formData.get("id") || "");
  const minKwp = Number(formData.get("min_kwp"));
  const maxKwpRaw = String(formData.get("max_kwp") || "").trim();
  const multiplierPct = Number(formData.get("multiplier_pct"));

  if (!id) return { error: "Falta el tramo a editar." };
  if (isNaN(minKwp) || minKwp < 0) return { error: "Ingresa un mínimo de kWp válido." };
  if (isNaN(multiplierPct)) return { error: "Ingresa un porcentaje válido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("price_tiers")
    .update({
      min_kwp: minKwp,
      max_kwp: maxKwpRaw ? Number(maxKwpRaw) : null,
      multiplier_pct: multiplierPct,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/catalog");
  return { error: null };
}

export async function deletePriceTierAction(id: string) {
  await requireAdminProfile();
  const supabase = await createClient();
  await supabase.from("price_tiers").delete().eq("id", id);
  revalidatePath("/catalog");
}

export async function updateMarginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminProfile();
  const marginPct = Number(formData.get("default_margin_pct"));
  const targetCoveragePct = Number(formData.get("default_target_coverage_pct"));
  if (isNaN(marginPct) || marginPct < 0) return { error: "Ingresa un margen válido." };
  if (isNaN(targetCoveragePct) || targetCoveragePct <= 0) {
    return { error: "Ingresa una cobertura objetivo válida." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({
      default_margin_pct: marginPct,
      default_target_coverage_pct: targetCoveragePct,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/catalog");
  return { error: null, message: "Configuración actualizada." };
}
