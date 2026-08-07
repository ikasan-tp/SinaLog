/**
 * プロフィールアイコンの選択肢。avatar_picker.htmlのアイコン定義を移植したもの。
 * svgはそのまま<svg>要素の中身として展開する(固定の信頼できる内容のみ)。
 */
export const AVATAR_ICON_OPTIONS: { key: string; label: string; svg: string }[] = [
  {
    key: "book",
    label: "本",
    svg: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2Z"/><path d="M19 18H6.5a2 2 0 0 0-2 2"/>',
  },
  {
    key: "eye",
    label: "目",
    svg: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  },
  {
    key: "compass",
    label: "コンパス",
    svg: '<circle cx="12" cy="12" r="9"/><path d="m14.5 9.5-2 5-5 2 2-5 5-2Z"/>',
  },
  {
    key: "dice",
    label: "サイコロ",
    svg: '<path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/><path d="M12 2v20M3 7l9 5 9-5M3 17l9-5 9 5"/>',
  },
  {
    key: "cat",
    label: "猫",
    svg: '<path d="M4 9 7 4l2 3h6l2-3 3 5v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z"/><circle cx="9" cy="13" r="0.6" fill="currentColor"/><circle cx="15" cy="13" r="0.6" fill="currentColor"/>',
  },
  {
    key: "moon",
    label: "月",
    svg: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  },
  {
    key: "lighthouse",
    label: "灯台",
    svg: '<path d="M9 22h6M10 22V10h4v12M8 10h8l-1.5-4h-5L8 10Z"/><path d="M12 2v2M8 4l1 2M16 4l-1 2"/>',
  },
  {
    key: "key",
    label: "鍵",
    svg: '<circle cx="8" cy="8" r="4"/><path d="m11 11 9 9m-4-4 2-2m-5.5 1.5 2 2"/>',
  },
];

export const AVATAR_ICON_MAP: Record<string, string> = Object.fromEntries(
  AVATAR_ICON_OPTIONS.map((o) => [o.key, o.svg])
);

/** avatar_picker.htmlの色選択肢。ThemeProviderのACCENT_OPTIONSと同じ8色（並び順も一致）。 */
export const AVATAR_COLOR_OPTIONS = [
  "#7A2430",
  "#3E5C4E",
  "#2E4A6B",
  "#8A5A1E",
  "#5B3A6B",
  "#2E6B6B",
  "#6B675E",
  "#B0632E",
];
