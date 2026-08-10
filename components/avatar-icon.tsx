import { AVATAR_ICON_MAP } from "@/lib/avatar-options";

/**
 * ユーザーのアバターを丸いアイコンとして表示する。
 * avatar_icon が選択肢に無い場合(未設定・データ不整合)は表示名の頭文字にフォールバックする。
 */
export function AvatarIcon({
  icon,
  color,
  displayName,
  size = 40,
}: {
  icon: string | null | undefined;
  color: string | null | undefined;
  displayName?: string | null;
  size?: number;
}) {
  const resolvedColor = color || "#7A2430";
  const Icon = icon ? AVATAR_ICON_MAP[icon] : undefined;

  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: `${resolvedColor}1A`,
        color: resolvedColor,
        fontSize: size * 0.36,
      }}
    >
      {Icon ? <Icon size={size * 0.48} strokeWidth={1.8} /> : (displayName?.slice(0, 1) ?? "?")}
    </div>
  );
}
