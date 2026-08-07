"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CreateScenarioState } from "../../new/actions";

/**
 * シナリオ情報の更新。
 * RLS側で「登録者本人のみ更新可能」に制限されているため、
 * 他人のシナリオを更新しようとした場合は0件更新のまま静かに失敗する
 * (エラーとしては返らないが、実害は無い＝更新されないだけ)。
 */
export async function updateScenario(
  scenarioId: string,
  _prevState: CreateScenarioState,
  formData: FormData
): Promise<CreateScenarioState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/scenarios/${scenarioId}/edit`);
  }

  const title = (formData.get("title") as string)?.trim();
  const distributionUrl = (formData.get("distributionUrl") as string)?.trim();
  const priceText = (formData.get("priceText") as string)?.trim();

  if (!title || !distributionUrl || !priceText) {
    return { error: "タイトル・価格・頒布元は必須です。" };
  }

  const tags = formData.getAll("tags") as string[];
  const requiredSupplements = formData.getAll("requiredSupplements") as string[];
  const wordCountRaw = formData.get("wordCount") as string;

  const { error } = await supabase
    .from("scenarios")
    .update({
      title,
      distribution_url: distributionUrl,
      price_text: priceText,
      author_name: (formData.get("authorName") as string) || null,
      circle_name: (formData.get("circleName") as string) || null,
      system_version: (formData.get("systemVersion") as string) || null,
      setting: (formData.get("setting") as string) || null,
      recommended_players: (formData.get("recommendedPlayers") as string) || null,
      play_time: (formData.get("playTime") as string) || null,
      has_combat: formData.get("hasCombat") === "on",
      word_count: wordCountRaw ? parseInt(wordCountRaw, 10) || null : null,
      description: (formData.get("description") as string) || null,
      thumbnail_url: (formData.get("thumbnailUrl") as string) || null,
      tags,
      required_supplements: requiredSupplements,
    })
    .eq("id", scenarioId)
    .eq("registered_by", user.id);

  if (error) {
    console.error("updateScenario error:", error);
    return { error: "更新に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/scenarios/${scenarioId}`);
  revalidatePath("/mypage");
  redirect(`/scenarios/${scenarioId}?updated=1`);
}
