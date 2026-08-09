"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateScenarioState = {
  error?: string;
};

/**
 * シナリオ登録フォームのSubmit先。
 * 必須項目はタイトル・価格・頒布元URLのみ(他は空欄可)。
 */
export async function createScenario(
  _prevState: CreateScenarioState,
  formData: FormData
): Promise<CreateScenarioState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/scenarios/new");
  }

  const title = (formData.get("title") as string)?.trim();
  const distributionUrl = (formData.get("distributionUrl") as string)?.trim();
  const priceText = (formData.get("priceText") as string)?.trim();

  if (!title || !distributionUrl || !priceText) {
    return { error: "タイトル・価格・頒布元は必須です。" };
  }

  const tags = formData.getAll("tags") as string[];
  const requiredSupplements = formData.getAll("requiredSupplements") as string[];
  const sessionFormats = formData.getAll("sessionFormats") as string[];
  const wordCountRaw = formData.get("wordCount") as string;

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      title,
      distribution_url: distributionUrl,
      price_text: priceText,
      author_name: (formData.get("authorName") as string) || null,
      circle_name: (formData.get("circleName") as string) || null,
      system_version: (formData.get("systemVersion") as string) || null,
      setting: (formData.get("setting") as string) || null,
      recommended_players: (formData.get("recommendedPlayers") as string) || null,
      play_time: (formData.get("playTime") as string) || null,
      session_formats: sessionFormats,
      has_combat: formData.get("hasCombat") === "on",
      word_count: wordCountRaw ? parseInt(wordCountRaw, 10) || null : null,
      description: (formData.get("description") as string) || null,
      thumbnail_url: (formData.get("thumbnailUrl") as string) || null,
      tags,
      required_supplements: requiredSupplements,
      registered_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createScenario error:", error);
    return { error: "登録に失敗しました。時間をおいて再度お試しください。" };
  }

  redirect(`/scenarios/${data.id}?registered=1`);
}
