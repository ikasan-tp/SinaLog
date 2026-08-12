import { findPlayTimeRange } from "@/lib/play-time";

/**
 * シナリオ登録・編集フォームのFormDataから、DB保存用の値をまとめて取り出す。
 * createScenario / updateScenario の両方で使う共通処理。
 */
export function extractScenarioFields(formData: FormData) {
  const isFree = formData.get("isFree") === "true";
  const priceYenRaw = formData.get("priceYen") as string;
  const wordCountRaw = formData.get("wordCount") as string;
  const playTimeRangeKey = (formData.get("playTimeRangeKey") as string) || "";
  const range = playTimeRangeKey ? findPlayTimeRange(playTimeRangeKey) : null;

  return {
    title: (formData.get("title") as string)?.trim(),
    distribution_url: (formData.get("distributionUrl") as string)?.trim(),
    author_name: (formData.get("authorName") as string) || null,
    circle_name: (formData.get("circleName") as string) || null,
    system_version: (formData.get("systemVersion") as string) || null,
    setting: (formData.get("setting") as string) || null,
    recommended_players: (formData.get("recommendedPlayers") as string) || null,
    play_time_text: (formData.get("playTimeText") as string) || null,
    play_time_min_minutes: range ? range.min : null,
    play_time_max_minutes: range ? range.max : null,
    is_free: isFree,
    price_yen: isFree ? null : priceYenRaw ? parseInt(priceYenRaw, 10) || null : null,
    has_combat: formData.get("hasCombat") === "on",
    word_count: wordCountRaw ? parseInt(wordCountRaw, 10) || null : null,
    loss_rate: (formData.get("lossRate") as string) || null,
    required_skills: (formData.get("requiredSkills") as string) || null,
    recommended_skills: (formData.get("recommendedSkills") as string) || null,
    rollable_skills: (formData.get("rollableSkills") as string) || null,
    discouraged: (formData.get("discouraged") as string) || null,
    description: (formData.get("description") as string) || null,
    description_is_quoted: formData.get("descriptionIsQuoted") === "on",
    thumbnail_url: (formData.get("thumbnailUrl") as string) || null,
    tags: formData.getAll("tags") as string[],
    required_supplements: formData.getAll("requiredSupplements") as string[],
  };
}

export function validateScenarioFields(fields: ReturnType<typeof extractScenarioFields>): string | null {
  if (!fields.title || !fields.distribution_url) {
    return "タイトル・頒布元は必須です。";
  }
  if (!fields.is_free && !fields.price_yen) {
    return "有料の場合は金額を入力してください。";
  }
  return null;
}
