"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateAvatar } from "../actions";
import { AVATAR_ICON_OPTIONS, AVATAR_COLOR_OPTIONS } from "@/lib/avatar-options";

export function AvatarPickerForm({
  displayName,
  initialIcon,
  initialColor,
}: {
  displayName: string;
  initialIcon: string;
  initialColor: string;
}) {
  const [icon, setIcon] = useState(initialIcon);
  const [color, setColor] = useState(initialColor);
  const [isPending, startTransition] = useTransition();

  const Icon = AVATAR_ICON_OPTIONS.find((o) => o.key === icon)?.icon ?? AVATAR_ICON_OPTIONS[0].icon;

  function handleSave() {
    startTransition(() => {
      updateAvatar(icon, color);
    });
  }

  return (
    <div className="rounded-xl border border-line bg-panel p-7">
      {/* プレビュー */}
      <div className="mb-6 flex items-center gap-5 border-b border-line pb-6">
        <div
          className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          <Icon size={36} strokeWidth={1.8} />
        </div>
        <div>
          <div className="mb-0.5 text-sm font-bold">{displayName}</div>
          <p className="text-xs text-ink-faint">
            マイページ・レビュー欄など、あなたのアイコンが表示されるすべての場所に反映されます
          </p>
        </div>
      </div>

      <div className="mb-3 text-xs font-bold text-ink-sub">アイコンを選ぶ</div>
      <div className="mb-7 grid grid-cols-4 gap-2.5 sm:grid-cols-8">
        {AVATAR_ICON_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setIcon(opt.key)}
            aria-label={opt.label}
            aria-pressed={icon === opt.key}
            className={`flex aspect-square items-center justify-center rounded-[10px] border transition-colors ${
              icon === opt.key
                ? "border-accent bg-accent-bg text-accent"
                : "border-line-strong text-ink-sub hover:bg-bg"
            }`}
          >
            <opt.icon size={20} strokeWidth={1.8} />
          </button>
        ))}
      </div>

      <div className="mb-3 text-xs font-bold text-ink-sub">好きな色を選ぶ</div>
      <div className="mb-8 flex flex-wrap gap-2.5">
        {AVATAR_COLOR_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={c}
            aria-pressed={color === c}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2"
            style={{
              backgroundColor: c,
              borderColor: color === c ? "var(--ink)" : "transparent",
            }}
          >
            {color === c && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2.5">
        <Link
          href="/mypage"
          className="rounded-lg border border-line-strong bg-panel px-6 py-2.5 text-[13px] text-ink-sub hover:bg-bg"
        >
          キャンセル
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-accent px-6 py-2.5 text-[13px] text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {isPending ? "保存中…" : "この組み合わせで保存"}
        </button>
      </div>
    </div>
  );
}
