"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractScenarioFields, validateScenarioFields } from "@/lib/scenario-fields";

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

  const fields = extractScenarioFields(formData);
  const validationError = validateScenarioFields(fields);
  if (validationError) return { error: validationError };

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      ...fields,
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
