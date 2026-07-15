"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/data";
import type { SkuCategory, SkuUnitType } from "@/lib/supabase/types";

export type ActionState = { error: string | null; message?: string | null };

export async function addSkuAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireAdminProfile();
  const category = String(formData.get("category") || "") as SkuCategory;
  const brand = String(formData.get("brand") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const capacityLabel = String(formData.get("capacity_label") || "").trim();
  const unitType = String(formData.get("unit_type") || "") as SkuUnitType;
  const unitCost = Number(formData.get("unit_cost_cop"));

  if (!brand || !model) return { error: "Escribe marca y modelo." };
  if (!unitCost || unitCost <= 0) return { error: "Ingresa un costo válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("product_skus").insert({
    category,
    brand,
    model,
    capacity_label: capacityLabel || null,
    unit_type: unitType,
    unit_cost_cop: unitCost,
    updated_by: profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/catalog");
  return { error: null };
}

export async function toggleSkuAction(id: string, isActive: boolean) {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  await supabase
    .from("product_skus")
    .update({ is_active: isActive, updated_by: profile.id, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/catalog");
}

export async function deleteSkuAction(id: string) {
  await requireAdminProfile();
  const supabase = await createClient();
  await supabase.from("product_skus").delete().eq("id", id);
  revalidatePath("/catalog");
}

export async function setDefaultSkuAction(id: string, category: SkuCategory) {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  // Solo puede haber un SKU por defecto por categoría (índice único parcial),
  // así que primero se desmarca cualquier otro default de esa categoría.
  await supabase
    .from("product_skus")
    .update({ is_default: false, updated_by: profile.id, updated_at: new Date().toISOString() })
    .eq("category", category)
    .eq("is_default", true);
  await supabase
    .from("product_skus")
    .update({ is_default: true, updated_by: profile.id, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/catalog");
}
