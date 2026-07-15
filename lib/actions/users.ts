"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminProfile } from "@/lib/data";

export async function setUserRoleAction(userId: string, makeAdmin: boolean) {
  const admin = await requireAdminProfile();
  if (userId === admin.id) {
    // Evita que un admin se quite el rol a sí mismo por error y se quede
    // sin nadie que pueda revertirlo.
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ role: makeAdmin ? "admin" : "sales" })
    .eq("id", userId);

  revalidatePath("/users");
}
