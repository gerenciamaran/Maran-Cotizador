"use client";

import { useTransition } from "react";
import { setUserRoleAction } from "@/lib/actions/users";

export function UserRoleToggle({
  userId,
  isAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => await setUserRoleAction(userId, !isAdmin))}
      className={`text-xs font-medium px-2.5 py-1.5 rounded-full border disabled:opacity-50 cursor-pointer transition ${
        isAdmin
          ? "border-danger/40 text-danger hover:bg-danger/5"
          : "border-blue-300 text-blue-600 hover:bg-blue-50"
      }`}
    >
      {pending ? "…" : isAdmin ? "Quitar admin" : "Hacer admin"}
    </button>
  );
}
