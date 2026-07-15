import Link from "next/link";
import { getAllQuotes, requireProfile } from "@/lib/data";
import { signOutAction } from "@/lib/actions/auth";
import { Card, CardTitle, Empty } from "@/components/ui";
import { DeleteQuoteButton } from "@/app/quotes/delete-quote-button";

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  calculated: "Calculada",
  sent: "Enviada",
  won: "Ganada",
  lost: "Perdida",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  calculated: "bg-blue-50 text-blue-700",
  sent: "bg-alert/10 text-alert",
  won: "bg-success/10 text-success",
  lost: "bg-danger/10 text-danger",
};

function stepForQuote(status: string) {
  if (status === "draft") return "step-1";
  return "step-4";
}

export default async function QuotesPage() {
  const profile = await requireProfile();
  const quotes = await getAllQuotes();

  return (
    <div className="max-w-[960px] mx-auto px-4 pt-6 pb-16">
      <div className="flex justify-between items-center bg-white border border-gray-100 shadow-sm p-3 md:px-5 rounded-2xl mb-4">
        <div className="font-heading text-lg text-gray-900">
          {profile.full_name ?? "Sin nombre"}
        </div>
        <div className="flex items-center gap-4">
          {profile.role === "admin" && (
            <>
              <Link href="/catalog" className="text-blue-600 text-sm hover:underline">
                Catálogo de precios
              </Link>
              <Link href="/users" className="text-blue-600 text-sm hover:underline">
                Usuarios
              </Link>
            </>
          )}
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-gray-500 underline text-sm cursor-pointer hover:text-gray-700"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>
            <span className="border-none pb-0 mb-0">Cotizaciones</span>
          </CardTitle>
          <Link
            href="/quotes/new"
            className="text-sm font-medium text-white bg-blue-600 hover:brightness-105 rounded-lg px-3.5 py-2 -mt-4"
          >
            + Nueva cotización
          </Link>
        </div>

        {quotes.length === 0 ? (
          <Empty>Todavía no hay cotizaciones. Crea la primera.</Empty>
        ) : (
          <div className="divide-y divide-gray-100">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="flex justify-between items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg"
              >
                <Link
                  href={`/quotes/${q.id}/${stepForQuote(q.status)}`}
                  className="flex-1 min-w-0"
                >
                  <div className="font-semibold text-sm text-gray-900">
                    {q.client_company_name ?? "Sin nombre de cliente todavía"}
                  </div>
                  <div className="font-mono text-[11px] text-gray-500">
                    {new Date(q.created_at).toLocaleDateString("es-CO")}
                    {q.total_budget_cop
                      ? ` · ${new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(q.total_budget_cop)}`
                      : ""}
                  </div>
                </Link>
                <div className="flex items-center gap-2.5 shrink-0">
                  {q.total_budget_cop && (
                    <a
                      href={`/api/quotes/${q.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Ver PDF
                    </a>
                  )}
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[q.status]}`}
                  >
                    {STATUS_LABELS[q.status]}
                  </span>
                  <DeleteQuoteButton id={q.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
