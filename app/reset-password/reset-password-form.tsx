"use client";

import { useActionState } from "react";
import { setNewPasswordAction, type ActionState } from "@/lib/actions/auth";
import { ModernButton, ModernPasswordField } from "@/components/modern-fields";

const initialState: ActionState = { error: null };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(setNewPasswordAction, initialState);

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-gray-900 text-center mb-2">
        Nueva contraseña
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Elige una nueva contraseña para tu cuenta.
      </p>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block font-mono text-[11px] uppercase text-gray-500 mb-1">
            Nueva contraseña
          </label>
          <ModernPasswordField name="password" placeholder="Mínimo 6 caracteres" required autoFocus />
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase text-gray-500 mb-1">
            Confirmar contraseña
          </label>
          <ModernPasswordField name="password2" placeholder="Repite la contraseña" required />
        </div>

        {state.error && <p className="text-danger text-sm font-medium">{state.error}</p>}

        <ModernButton type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar contraseña"}
        </ModernButton>
      </form>
    </>
  );
}
