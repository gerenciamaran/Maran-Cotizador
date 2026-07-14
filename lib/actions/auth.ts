"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type ActionState = { error: string | null; message?: string | null };

export async function signInAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    return { error: "Ingresa correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/quotes");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const generic: ActionState = {
    error: null,
    message:
      "Si ese correo está registrado, te llegará un enlace para restablecer tu contraseña.",
  };
  if (!email) return generic;

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  const supabase = await createClient();
  // No revisamos el resultado ni distinguimos el mensaje: así no se puede
  // usar este formulario para averiguar qué correos están registrados.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${protocol}://${host}/auth/confirm?next=/reset-password`,
  });

  return generic;
}

export async function setNewPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") || "");
  const password2 = String(formData.get("password2") || "");

  if (password.length < 6) return { error: "Mínimo 6 caracteres." };
  if (password !== password2) return { error: "Las contraseñas no coinciden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "El enlace no es válido o ya expiró. Pide uno nuevo." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/quotes");
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const password2 = String(formData.get("password2") || "");

  if (!fullName) return { error: "Escribe tu nombre completo." };
  if (!email) return { error: "Escribe tu correo." };
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }
  if (password !== password2) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  if (!data.user) return { error: "No se pudo crear la cuenta." };

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    full_name: fullName,
  });

  if (profileError) {
    return {
      error:
        "Tu cuenta se creó pero no se pudo guardar tu perfil: " +
        profileError.message,
    };
  }

  if (!data.session) {
    return {
      error: null,
      message:
        "Cuenta creada. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.",
    };
  }

  redirect("/quotes");
}
