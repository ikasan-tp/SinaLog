/**
 * プレイ時間の「検索用の目安」選択肢。
 * 登録フォームでは、自由記述の表示文言(play_time_text)とは別に、
 * ここから一番近いレンジを選んでもらい、min/max(分)として保存する。
 * 検索ページでは、選択したレンジとシナリオの[min,max]が重なるものを表示する。
 */
export const PLAY_TIME_RANGES: { key: string; label: string; min: number; max: number | null }[] = [
  { key: "0-120", label: "2時間以内", min: 0, max: 120 },
  { key: "120-240", label: "2〜4時間", min: 120, max: 240 },
  { key: "240-360", label: "4〜6時間", min: 240, max: 360 },
  { key: "360-480", label: "6〜8時間", min: 360, max: 480 },
  { key: "480-720", label: "8〜12時間", min: 480, max: 720 },
  { key: "720-1200", label: "12〜20時間", min: 720, max: 1200 },
  { key: "1200-null", label: "20時間以上", min: 1200, max: null },
];

export function findPlayTimeRange(key: string) {
  return PLAY_TIME_RANGES.find((r) => r.key === key) ?? null;
}

/** min/max(分)から一致するレンジのkeyを逆引きする(編集フォームの初期値表示用)。 */
export function findPlayTimeRangeKeyByMinutes(min: number | null, max: number | null): string {
  if (min === null) return "";
  const found = PLAY_TIME_RANGES.find((r) => r.min === min && r.max === max);
  return found?.key ?? "";
}
