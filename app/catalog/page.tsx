import Link from "next/link";
import { getAppSettings, requireAdminProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Empty } from "@/components/ui";
import { AddCatalogItemForm, MarginForm, ToggleCatalogItemButton } from "@/app/catalog/catalog-forms";
import { DeleteCatalogItemButton } from "@/app/catalog/catalog-forms";

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
};

export default async function CatalogPage() {
  await requireAdminProfile();
  const supabase = await createClient();
  const [{ data: catalog }, settings] = await Promise.all([
    supabase.from("price_catalog").select("*").order("category"),
    getAppSettings(),
  ]);

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
        <CardTitle>Catálogo de precios</CardTitle>
        {!catalog || catalog.length === 0 ? (
          <Empty>Sin ítems en el catálogo todavía.</Empty>
        ) : (
          <div className="divide-y divide-gray-100 mb-4">
            {catalog.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2.5">
                <div>
                  <div className={`text-sm font-semibold ${item.is_active ? "text-gray-900" : "text-gray-400 line-through"}`}>
                    {item.name}
                  </div>
                  <div className="font-mono text-[11px] text-gray-500">
                    {CATEGORY_LABELS[item.category]} ·{" "}
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(item.unit_cost_cop)}{" "}
                    {UNIT_LABELS[item.unit_type]}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ToggleCatalogItemButton id={item.id} isActive={item.is_active} />
                  <DeleteCatalogItemButton id={item.id} />
                </div>
              </div>
            ))}
          </div>
        )}
        <AddCatalogItemForm />
      </Card>
    </div>
  );
}
