import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Cliente con la service role key: ignora RLS por completo. SOLO para uso
// server-side en operaciones de confianza (ej. procesar OCR o generar el PDF
// de una cotización). Nunca importar desde un componente cliente ni exponer
// esta key con el prefijo NEXT_PUBLIC_.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
