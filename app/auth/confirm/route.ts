import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Recibe el ?code= del enlace de recuperación de contraseña que Supabase
// envía por correo, lo intercambia por una sesión real (esto SÍ puede fijar
// cookies porque es un Route Handler, a diferencia de un Server Component),
// y redirige a /reset-password ya autenticado.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") || "/reset-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const url = new URL("/forgot-password", request.url);
  url.searchParams.set("error", "El enlace no es válido o ya expiró. Pide uno nuevo.");
  return NextResponse.redirect(url);
}
