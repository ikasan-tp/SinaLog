"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ToggleHelpfulResult = {
  voted: boolean;
  error?: string;
};

/**
 * 「参考になった」の投票をトグルする(押す→取り消す→また押す、ができる)。
 *
 * review_helpful_votes テーブルへの insert/delete で行い、
 * reviews.helpful_count はDB側のトリガー(0013_review_helpful_votes.sql)が
 * 自動で同期するため、ここでは直接カウントを操作しない。
 *
 * 1ユーザー1レビュー1票・自分のレビューには投票不可、という制約は
 * RLS(insertポリシー)側でも強制しているため、ここでのチェックは
 * 分かりやすいエラーメッセージを返すための冗長化。
 */
export async function toggleHelpful(reviewId: string, scenarioId: string): Promise<ToggleHelpfulResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { voted: false, error: "ログインが必要です" };

  const { data: review } = await supabase
    .from("reviews")
    .select("user_id")
    .eq("id", reviewId)
    .single();
  if (!review) return { voted: false, error: "レビューが見つかりません" };
  if (review.user_id === user.id) {
    return { voted: false, error: "自分のレビューには投票できません" };
  }

  const { data: existing } = await supabase
    .from("review_helpful_votes")
    .select("review_id")
    .eq("review_id", reviewId)
    .eq("voter_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("review_helpful_votes")
      .delete()
      .eq("review_id", reviewId)
      .eq("voter_id", user.id);
    if (error) return { voted: true, error: "取り消しに失敗しました" };
    revalidatePath(`/scenarios/${scenarioId}`);
    revalidatePath("/mypage");
    return { voted: false };
  }

  const { error } = await supabase
    .from("review_helpful_votes")
    .insert({ review_id: reviewId, voter_id: user.id });
  if (error) return { voted: false, error: "投票に失敗しました" };

  revalidatePath(`/scenarios/${scenarioId}`);
  revalidatePath("/mypage");
  return { voted: true };
}
