import Link from "next/link";
import { getAllProfilesWithEmail, requireAdminProfile } from "@/lib/data";
import { Card, CardTitle, Empty } from "@/components/ui";
import { UserRoleToggle } from "@/app/users/user-role-toggle";

export default async function UsersPage() {
  const admin = await requireAdminProfile();
  const profiles = await getAllProfilesWithEmail();

  return (
    <div className="max-w-[720px] mx-auto px-4 pt-6 pb-16">
      <Link
        href="/quotes"
        className="font-mono text-xs text-gray-500 hover:text-gray-700 underline mb-2.5 inline-block"
      >
        ← Volver a cotizaciones
      </Link>

      <Card>
        <CardTitle>Usuarios</CardTitle>
        {profiles.length === 0 ? (
          <Empty>Sin usuarios todavía.</Empty>
        ) : (
          <div className="divide-y divide-gray-100">
            {profiles.map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2.5">
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {p.full_name ?? "Sin nombre"}
                    {p.role === "admin" && (
                      <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-gray-900 text-white align-middle">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-gray-500">{p.email ?? "—"}</div>
                </div>
                {p.id === admin.id ? (
                  <span className="font-mono text-[11px] text-gray-500">Tu cuenta</span>
                ) : (
                  <UserRoleToggle userId={p.id} isAdmin={p.role === "admin"} />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
