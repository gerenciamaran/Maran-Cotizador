import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Accesibles sin sesión; si YA hay sesión, redirige a /quotes (no tiene
// sentido ver el login o pedir un reseteo de contraseña estando logueado).
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

// Nunca redirige en ningún sentido: /auth/confirm intercambia el código del
// correo de recuperación por una sesión, y eso debe poder correr incluso si
// el navegador ya tenía una sesión distinta o ninguna.
const ALWAYS_PASSTHROUGH_PATHS = ["/auth"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isAlwaysPassthrough = ALWAYS_PASSTHROUGH_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );
  if (isAlwaysPassthrough) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/quotes";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
