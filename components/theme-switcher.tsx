"use client";

import { ACCENT_OPTIONS, useTheme } from "./theme-provider";

/**
 * マイページの「アカウント設定」等に置く想定のテーマ切替UI。
 * ライト/ダークの切替と、アクセントカラー(8色)の選択ができる。
 */
export function ThemeSwitcher() {
  const { mode, accent, setMode, setAccent } = useTheme();

  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <div className="mb-4">
        <div className="mb-2 text-xs font-bold text-ink-sub">表示モード</div>
        <div className="flex gap-2">
          {(["light", "dark"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                mode === m
                  ? "border-accent bg-accent-bg text-accent"
                  : "border-line-strong text-ink-sub hover:border-ink-faint"
              }`}
            >
              {m === "light" ? "ライト" : "ダーク"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-bold text-ink-sub">テーマカラー</div>
        <div className="flex flex-wrap gap-2">
          {ACCENT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setAccent(opt.key)}
              title={opt.label}
              aria-label={opt.label}
              className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-105"
              style={{
                backgroundColor: opt.hex,
                borderColor: accent === opt.key ? "var(--ink)" : "transparent",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
