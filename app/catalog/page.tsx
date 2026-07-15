import Link from "next/link";
import { getAppSettings, requireAdminProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Empty } from "@/components/ui";
import {
  AddCatalogItemForm,
  AddPriceTierForm,
  AddSkuForm,
  DeleteCatalogItemButton,
  DeleteSkuButton,
  MarginForm,
  PriceTierRow,
  SetDefaultSkuButton,
  ToggleCatalogItemButton,
  ToggleSkuButton,
} from "@/app/catalog/catalog-forms";
import type { PriceTier } from "@/lib/supabase/types";

const CATEGORY_LABELS: Record<string, string> = {
  panel: "Panel",
  inverter: "Inversor",
  structure: "Estructura",
  labor: "Mano de obra",
  other: "Otro",
};

const UNIT_LABELS: Record<string, string> = {
  per_wp: "por Wp",
  per_kwp: "por kWp",
  flat: "fijo",
  percent: "% del subtotal",
  tiered_flat: "escalonado, fijo por tramo",
  tiered_rate: "escalonado, tarifa por tramo",
};

function formatCop(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function CatalogPage() {
  await requireAdminProfile();
  const supabase = await createClient();
  const [{ data: catalog }, { data: tiers }, { data: skus }, settings] = await Promise.all([
    supabase.from("price_catalog").select("*").order("category"),
    supabase.from("price_tiers").select("*").order("band_order"),
    supabase.from("product_skus").select("*").order("category").order("brand"),
    getAppSettings(),
  ]);

  const tiersByItemId: Record<string, PriceTier[]> = {};
  for (const tier of tiers ?? []) {
    (tiersByItemId[tier.price_catalog_id] ??= []).push(tier);
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 pt-6 pb-16">
      <Link href="/quotes" className="font-mono text-xs text-gray-500 hover:text-gray-700 underline mb-2.5 inline-block">
        ← Volver a cotizaciones
      </Link>

      <Card>
        <CardTitle>Márgenes y dimensionamiento por defecto</CardTitle>
        <MarginForm
          currentMargin={settings.default_margin_pct}
          currentTargetCoveragePct={settings.default_target_coverage_pct}
        />
      </Card>

      <Card>
        <CardTitle>Modelos de panel/inversor</CardTitle>
        {!skus || skus.length === 0 ? (
          <Empty>Sin modelos todavía.</Empty>
        ) : (
          <div className="divide-y divide-gray-100 mb-4">
            {skus.map((sku) => (
              <div key={sku.id} className="flex justify-between items-center py-2.5">
                <div>
                  <div className={`text-sm font-semibold ${sku.is_active ? "text-gray-900" : "text-gray-400 line-through"}`}>
                    {sku.brand} {sku.model}
                  </div>
                  <div className="font-mono text-[11px] text-gray-500">
                    {CATEGORY_LABELS[sku.category]}
                    {sku.capacity_label ? ` · ${sku.capacity_label}` : ""} ·{" "}
                    {formatCop(sku.unit_cost_cop)} {UNIT_LABELS[sku.unit_type]}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SetDefaultSkuButton id={sku.id} category={sku.category} isDefault={sku.is_default} />
                  <ToggleSkuButton id={sku.id} isActive={sku.is_active} />
                  <DeleteSkuButton id={sku.id} />
                </div>
              </div>
            ))}
          </div>
        )}
        <AddSkuForm />
      </Card>

      <Card>
        <CardTitle>Catálogo de precios</CardTitle>
        {!catalog || catalog.length === 0 ? (
          <Empty>Sin ítems en el catálogo todavía.</Empty>
        ) : (
          <div className="divide-y divide-gray-100 mb-4">
            {catalog.map((item) => {
              const itemTiers = tiersByItemId[item.id] ?? [];
              const isTiered = item.unit_type === "tiered_flat" || item.unit_type === "tiered_rate";
              return (
                <div key={item.id} className="py-2.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`text-sm font-semibold ${item.is_active ? "text-gray-900" : "text-gray-400 line-through"}`}>
                        {item.name}
                      </div>
                      <div className="font-mono text-[11px] text-gray-500">
                        {CATEGORY_LABELS[item.category]} · {formatCop(item.unit_cost_cop)}{" "}
                        {UNIT_LABELS[item.unit_type]}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleCatalogItemButton id={item.id} isActive={item.is_active} />
                      <DeleteCatalogItemButton id={item.id} />
                    </div>
                  </div>
                  {isTiered && (
                    <div className="mt-2 ml-3 pl-3 border-l-2 border-gray-100">
                      {itemTiers.map((tier) => (
                        <PriceTierRow key={tier.id} tier={tier} />
                      ))}
                      <AddPriceTierForm
                        priceCatalogId={item.id}
                        nextBandOrder={itemTiers.length}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <AddCatalogItemForm />
      </Card>
    </div>
  );
}
