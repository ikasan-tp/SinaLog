"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 「参考になった」のカウントアップ。
 * 簡易実装のため、同じ人が何度も押すと際限なく増える。
 * 本格運用する場合は review_helpful_votes(review_id, user_id) の中間テーブルを作り、
 * 既に押したユーザーかどうかをそこで判定する形に拡張するとよい。
 */
export async function markHelpful(reviewId: string, scenarioId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: review } = await supabase
    .from("reviews")
    .select("helpful_count")
    .eq("id", reviewId)
    .single();

  if (!review) return;

  await supabase
    .from("reviews")
    .update({ helpful_count: review.helpful_count + 1 })
    .eq("id", reviewId);

  revalidatePath(`/scenarios/${scenarioId}`);
}
