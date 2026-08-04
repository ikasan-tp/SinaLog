"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateReviewState = {
  error?: string;
};

export async function createReview(
  scenarioId: string,
  _prevState: CreateReviewState,
  formData: FormData
): Promise<CreateReviewState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/scenarios/${scenarioId}/review/new`);
  }

  const goodPoint = (formData.get("goodPoint") as string)?.trim();
  const role = formData.get("role") as string;
  const playFormat = formData.get("playFormat") as string;
  const recommend = formData.get("recommend") as string;

  if (!goodPoint) {
    return { error: "良かった点を入力してください。" };
  }
  if (!role || !playFormat || !recommend) {
    return { error: "プレイした立場・プレイ形式・総合評価は必須です。" };
  }

  const getOrNull = (key: string) => (formData.get(key) as string) || null;

  const { error } = await supabase.from("reviews").upsert(
    {
      scenario_id: scenarioId,
      user_id: user.id,
      role,
      play_format: playFormat,
      recommend: recommend === "yes",

      modification: getOrNull("modification") ?? "none",
      modification_details: formData.getAll("modificationDetails") as string[],
      modification_advice: getOrNull("modificationAdvice"),

      exploration_difficulty: getOrNull("explorationDifficulty"),
      combat_intensity: getOrNull("combatIntensity"),
      kp_or_pc_load: getOrNull("kpOrPcLoad"),

      replay_intention: getOrNull("replayIntention"),
      group_dependency: getOrNull("groupDependency"),
      session_note: getOrNull("sessionNote"),

      content_warning_adequacy: getOrNull("contentWarningAdequacy"),

      homage_answer: getOrNull("homageAnswer"),
      homage_note: getOrNull("homageNote"),

      ai_usage_answer: getOrNull("aiUsageAnswer"),
      price_fairness: getOrNull("priceFairness"),

      good_point: goodPoint,
      concern_point: getOrNull("concernPoint"),
      spoiler_text: getOrNull("spoilerText"),

      elements: formData.getAll("elements") as string[],
      tags: formData.getAll("tags") as string[],
    },
    { onConflict: "scenario_id,user_id" }
  );

  if (error) {
    console.error("createReview error:", error);
    return { error: "投稿に失敗しました。時間をおいて再度お試しください。" };
  }

  redirect(`/scenarios/${scenarioId}?reviewed=1`);
}
