"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "@/lib/actions/auth";
import {
  ModernButton,
  ModernPasswordField,
  modernInputClass,
  modernLabelClass,
} from "@/components/modern-fields";

const initialState: ActionState = { error: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  if (state.message) {
    return (
      <div className="text-center">
        <h1 className="font-heading text-xl font-bold text-gray-900 mb-3">Cuenta creada</h1>
        <p className="text-sm text-gray-600 mb-4">{state.message}</p>
        <Link href="/login" className="text-blue-600 font-medium hover:underline text-sm">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-gray-900 text-center mb-6">
        Crear cuenta
      </h1>
      <form action={formAction} className="space-y-4">
        <div>
          <label className={modernLabelClass}>Nombre completo</label>
          <input
            name="full_name"
            className={modernInputClass}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>

        <div>
          <label className={modernLabelClass}>Correo</label>
          <input
            type="email"
            name="email"
            className={modernInputClass}
            placeholder="correo@maranenergy.com"
            required
          />
        </div>

        <div>
          <label className={modernLabelClass}>Contraseña</label>
          <ModernPasswordField name="password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div>
          <label className={modernLabelClass}>Confirmar contraseña</label>
          <ModernPasswordField name="password2" placeholder="Repite la contraseña" required />
        </div>

        {state.error && <p className="text-danger text-sm font-medium">{state.error}</p>}

        <ModernButton type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear cuenta"}
        </ModernButton>
        <Link
          href="/login"
          className="block text-center text-sm text-gray-500 hover:underline"
        >
          Cancelar
        </Link>
      </form>
    </>
  );
}
