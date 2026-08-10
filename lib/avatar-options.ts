import {
  BookOpen,
  Eye,
  Compass,
  Dices,
  Cat,
  Moon,
  Anchor,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

/**
 * プロフィールアイコンの選択肢。
 * 以前は手描きのSVGパスを直書きしていたが、コンパスや鍵の形が歪んでいたため、
 * フリー配布のLucideアイコン(MITライセンス, https://lucide.dev)のコンポーネントに置き換えた。
 *
 * 注意: Lucideには「灯台」そのものの単独アイコンが無いため、代わりに近いテーマの
 * 「錨(Anchor)」を採用している。key(DB保存値)は既存データとの互換のため
 * 元の"lighthouse"のまま維持し、表示だけAnchorに差し替えている。
 */
export const AVATAR_ICON_OPTIONS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "book", label: "本", icon: BookOpen },
  { key: "eye", label: "目", icon: Eye },
  { key: "compass", label: "コンパス", icon: Compass },
  { key: "dice", label: "サイコロ", icon: Dices },
  { key: "cat", label: "猫", icon: Cat },
  { key: "moon", label: "月", icon: Moon },
  { key: "lighthouse", label: "錨", icon: Anchor },
  { key: "key", label: "鍵", icon: KeyRound },
];

export const AVATAR_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  AVATAR_ICON_OPTIONS.map((o) => [o.key, o.icon])
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
