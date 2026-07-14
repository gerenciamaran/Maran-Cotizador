import { requireProfile } from "@/lib/data";
import { signOutAction } from "@/lib/actions/auth";
import { Card, CardTitle, Empty } from "@/components/ui";

export default async function QuotesPage() {
  const profile = await requireProfile();

  return (
    <div className="max-w-[960px] mx-auto px-4 pt-6 pb-16">
      <div className="flex justify-between items-center bg-white border border-gray-100 shadow-sm p-3 md:px-5 rounded-2xl mb-4">
        <div className="font-heading text-lg text-gray-900">
          {profile.full_name ?? "Sin nombre"}
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-gray-500 underline text-sm cursor-pointer hover:text-gray-700"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      <Card>
        <CardTitle>Cotizaciones</CardTitle>
        <Empty>Todavía no hay cotizaciones. El asistente para crear una llega en la siguiente fase.</Empty>
      </Card>
    </div>
  );
}
