"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { signInAction, type ActionState } from "@/lib/actions/auth";
import { ModernButton, ModernField, ModernPasswordField } from "@/components/modern-fields";
import { LockIcon, MailIcon } from "@/components/auth-icons";

const initialState: ActionState = { error: null };
const LAST_EMAIL_KEY = "cotizador_last_email";

export function LoginBoard() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(LAST_EMAIL_KEY);
    if (!saved) return;
    const timeoutId = setTimeout(() => setEmail(saved), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
          <LockIcon width={26} height={26} className="text-blue-600" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Iniciar sesión</h1>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block font-mono text-[11px] uppercase text-gray-500 mb-1">
            Correo electrónico
          </label>
          <ModernField
            icon={MailIcon}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@maranenergy.com"
            required
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase text-gray-500 mb-1">
            Contraseña
          </label>
          <ModernPasswordField name="password" placeholder="Contraseña" required />
        </div>

        <div className="flex items-center justify-end text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {state.error && <p className="text-danger text-sm font-medium">{state.error}</p>}

        <ModernButton type="submit" disabled={pending}>
          {pending ? "Entrando…" : "Entrar →"}
        </ModernButton>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        ¿Nuevo aquí?{" "}
        <Link href="/register" className="text-blue-600 font-medium hover:underline">
          + Crear cuenta
        </Link>
      </p>
    </>
  );
}
