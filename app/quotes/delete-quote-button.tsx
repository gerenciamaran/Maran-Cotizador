"use client";

import { useState, useTransition } from "react";
import { deleteQuoteAction } from "@/lib/actions/quotes";

export function DeleteQuoteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">¿Seguro?</span>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => await deleteQuoteAction(id))}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full bg-danger text-white hover:brightness-110 disabled:opacity-50 cursor-pointer transition"
        >
          {pending ? "…" : "Sí, borrar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-danger/40 text-danger hover:bg-danger/5 cursor-pointer transition"
    >
      Eliminar
    </button>
  );
}
