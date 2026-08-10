"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactState = { error?: string; success?: boolean };

export async function submitContact(_prevState: ContactState, formData: FormData): Promise<ContactState> {
  const message = (formData.get("message") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();

  if (!message) {
    return { error: "内容を入力してください。" };
  }
  if (message.length > 2000) {
    return { error: "内容は2000文字以内で入力してください。" };
  }

  const supabase = await createClient();
  // ログイン中なら参考情報として記録するが、必須ではない(匿名でも送信できる)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contact_messages").insert({
    user_id: user?.id ?? null,
    email: email || null,
    message,
  });

  if (error) {
    return { error: "送信に失敗しました。時間をおいて再度お試しください。" };
  }
  return { success: true };
}
