import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppSettings, PriceCatalogItem, Profile, Quote } from "@/lib/supabase/types";

export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  return profile;
}

export async function requireAdminProfile(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/quotes");
  return profile;
}

export async function getAllQuotes(): Promise<Quote[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("quotes").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getActiveCatalog(): Promise<PriceCatalogItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("price_catalog")
    .select("*")
    .eq("is_active", true)
    .order("category");
  return data ?? [];
}

export interface ProfileWithEmail extends Profile {
  email: string | null;
}

export async function getAllProfilesWithEmail(): Promise<ProfileWithEmail[]> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (!profiles) return [];

  // profiles no guarda el correo (vive en auth.users); se resuelve aparte
  // con el cliente de service role solo para mostrarlo en esta pantalla.
  const admin = createAdminClient();
  const { data: usersData } = await admin.auth.admin.listUsers();
  const emailById = new Map(usersData?.users.map((u) => [u.id, u.email ?? null]) ?? []);

  return profiles.map((p) => ({ ...p, email: emailById.get(p.id) ?? null }));
}

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("*").eq("id", 1).single();
  return (
    data ?? {
      id: 1,
      default_margin_pct: 25,
      default_performance_ratio: 0.8,
      default_target_coverage_pct: 100,
      company_name: "MARÁN ENERGY",
      updated_at: new Date().toISOString(),
    }
  );
}
