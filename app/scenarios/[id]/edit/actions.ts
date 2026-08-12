"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractScenarioFields, validateScenarioFields } from "@/lib/scenario-fields";
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

  const fields = extractScenarioFields(formData);
  const validationError = validateScenarioFields(fields);
  if (validationError) return { error: validationError };

  const { error } = await supabase
    .from("scenarios")
    .update(fields)
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
