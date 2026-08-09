"use client";

import { useState } from "react";

/**
 * タグをカテゴリごとに折りたたんで表示する共通UI。
 * 一度に全カテゴリのタグが並ぶと見づらい・目が疲れるため、
 * 見出しをクリックしてカテゴリ単位で開閉できるようにしている。
 * 選択済みの数はタイトル横にバッジ表示するので、閉じていても選択状況が分かる。
 */
export function CollapsibleTagGroup({
  title,
  selectedCount,
  defaultOpen = false,
  tone = "default",
  children,
}: {
  title: string;
  selectedCount?: number;
  defaultOpen?: boolean;
  tone?: "default" | "sensitive";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen || (selectedCount ?? 0) > 0);

  const isSensitive = tone === "sensitive";

  return (
    <div
      className={
        isSensitive
          ? "overflow-hidden rounded-lg border border-[#D8B98E] bg-[#FBF3E7]"
          : "overflow-hidden rounded-lg border border-line"
      }
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-bold transition-colors ${
          isSensitive ? "text-[#8A5A1E] hover:bg-[#F1DFC0]/40" : "text-ink-sub hover:bg-bg"
        }`}
      >
        <span className="flex items-center gap-1.5">
          {title}
          {!!selectedCount && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                isSensitive ? "bg-[#8A5A1E] text-white" : "bg-accent text-white"
              }`}
            >
              {selectedCount}
            </span>
          )}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="border-t px-3.5 py-3 [border-color:inherit]">{children}</div>}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
