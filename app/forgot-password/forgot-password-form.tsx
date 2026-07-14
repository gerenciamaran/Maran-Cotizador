"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type ActionState } from "@/lib/actions/auth";
import { ModernButton, ModernField } from "@/components/modern-fields";
import { MailIcon } from "@/components/auth-icons";

const initialState: ActionState = { error: null };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState
  );

  if (state.message) {
    return (
      <div className="text-center">
        <h1 className="font-heading text-xl font-bold text-gray-900 mb-3">Revisa tu correo</h1>
        <p className="text-sm text-gray-600 mb-4">{state.message}</p>
        <Link href="/login" className="text-blue-600 font-medium hover:underline text-sm">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-gray-900 text-center mb-2">
        Recuperar contraseña
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Escribe tu correo y te enviaremos un enlace para restablecerla.
      </p>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block font-mono text-[11px] uppercase text-gray-500 mb-1">
            Correo electrónico
          </label>
          <ModernField icon={MailIcon} type="email" name="email" placeholder="correo@maranenergy.com" required />
        </div>

        {state.error && <p className="text-danger text-sm font-medium">{state.error}</p>}

        <ModernButton type="submit" disabled={pending}>
          {pending ? "Enviando…" : "Enviar enlace"}
        </ModernButton>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </>
  );
}
