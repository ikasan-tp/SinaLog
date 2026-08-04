"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReportReviewState = {
  error?: string;
  success?: boolean;
};

/** レビューへの通報を作成する(ログインユーザーなら誰でも) */
export async function reportReview(
  reviewId: string,
  scenarioId: string,
  _prevState: ReportReviewState,
  formData: FormData
): Promise<ReportReviewState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "通報にはログインが必要です。" };
  }

  const reason = formData.get("reason") as string;
  const comment = (formData.get("comment") as string) || null;

  if (!reason) {
    return { error: "通報理由を選択してください。" };
  }

  const { error } = await supabase.from("reports").insert({
    review_id: reviewId,
    reporter_id: user.id,
    reason,
    comment,
  });

  if (error) {
    // unique制約(同じ人が同じレビューを二重通報)にひっかかった場合もここに来る
    return { error: "通報に失敗しました。既に通報済みの可能性があります。" };
  }

  revalidatePath(`/scenarios/${scenarioId}`);
  return { success: true };
}

/** 管理者が通報を却下する */
export async function dismissReport(reportId: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  await supabase.from("reports").update({ status: "dismissed", resolved_at: new Date().toISOString() }).eq("id", reportId);
  revalidatePath("/admin/reports");
}

/** 管理者が通報対象のレビューを非表示にする */
export async function hideReviewFromReport(reportId: string, reviewId: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  await supabase.from("reviews").update({ is_hidden: true }).eq("id", reviewId);
  await supabase
    .from("reports")
    .update({ status: "hidden", resolved_at: new Date().toISOString() })
    .eq("id", reportId);

  revalidatePath("/admin/reports");
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("管理者権限が必要です");
}
