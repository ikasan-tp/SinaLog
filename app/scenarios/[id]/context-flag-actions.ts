"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ToggleContextFlagResult = {
  flagged: boolean;
  error?: string;
};

/**
 * 「シナリオ以外の要因が大きそう」フィードバックのトグル。
 *
 * 重要: これは「参考になった」「通報」とは完全に独立した機能。
 * - レビューの削除・非表示・星評価(recommend)・helpful_count には一切影響しない
 * - 管理画面(/admin/reports)にも表示されない、あくまで読み手向けの補助情報
 */
export async function toggleContextFlag(reviewId: string, scenarioId: string): Promise<ToggleContextFlagResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { flagged: false, error: "ログインが必要です" };

  const { data: review } = await supabase
    .from("reviews")
    .select("user_id")
    .eq("id", reviewId)
    .single();
  if (!review) return { flagged: false, error: "レビューが見つかりません" };
  if (review.user_id === user.id) {
    return { flagged: false, error: "自分のレビューには使えません" };
  }

  const { data: existing } = await supabase
    .from("review_context_flags")
    .select("review_id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("review_context_flags")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);
    if (error) return { flagged: true, error: "取り消しに失敗しました" };
    revalidatePath(`/scenarios/${scenarioId}`);
    return { flagged: false };
  }

  const { error } = await supabase
    .from("review_context_flags")
    .insert({ review_id: reviewId, user_id: user.id });
  if (error) return { flagged: false, error: "送信に失敗しました" };

  revalidatePath(`/scenarios/${scenarioId}`);
  return { flagged: true };
}
