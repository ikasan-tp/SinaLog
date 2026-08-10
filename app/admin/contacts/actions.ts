"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("管理者権限が必要です");
}

export async function resolveContact(id: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  await supabase.from("contact_messages").update({ status: "resolved" }).eq("id", id);
  revalidatePath("/admin/contacts");
}
