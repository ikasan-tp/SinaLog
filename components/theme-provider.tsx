"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type AccentColor =
  | "wine" | "forest" | "navy" | "amber"
  | "violet" | "teal" | "gray" | "terracotta";

export const ACCENT_OPTIONS: { key: AccentColor; label: string; hex: string }[] = [
  { key: "wine", label: "ワイン", hex: "#7A2430" },
  { key: "forest", label: "深緑", hex: "#3E5C4E" },
  { key: "navy", label: "紺", hex: "#2E4A6B" },
  { key: "amber", label: "琥珀", hex: "#8A5A1E" },
  { key: "violet", label: "紫", hex: "#5B3A6B" },
  { key: "teal", label: "ティール", hex: "#2E6B6B" },
  { key: "gray", label: "グレー", hex: "#6B675E" },
  { key: "terracotta", label: "テラコッタ", hex: "#B0632E" },
];

const STORAGE_KEY = "sinalog-theme";

type ThemePrefs = { mode: ThemeMode; accent: AccentColor };
const DEFAULT_PREFS: ThemePrefs = { mode: "light", accent: "wine" };

type ThemeContextValue = ThemePrefs & {
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyToDocument(prefs: ThemePrefs) {
  const root = document.documentElement;
  root.setAttribute("data-theme", prefs.mode);
  root.setAttribute("data-accent", prefs.accent);
}

/**
 * アプリ全体をこれで包む(app/layout.tsxで使用)。
 * 個人ごとのテーマ設定を管理する。
 *
 * 保存の優先順位:
 *   1. ログイン中: Supabaseの users.theme_mode / users.theme_color (今後実装)
 *   2. 未ログイン、または未実装の間: localStorage
 *
 * 今はlocalStorageのみで完結させている。ログイン連携は
 * 「ログイン時にDBの値をここへ流し込み、変更時にDBへも書き込む」
 *形で拡張すればよい。
 */
function readInitialPrefs(): ThemePrefs {
  // SSR時はwindowが無いため、既定値を返す(layout.tsx側のscriptがCSS変数は先に反映済み)
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ThemePrefs>(readInitialPrefs);

  // マウント時点でDOMへ反映しておく(layout.tsxのインラインscriptで
  // 初回ペイント前には近い状態になっているが、React側の状態とも同期させる)
  useEffect(() => {
    applyToDocument(prefs);
    // 初回マウント時のみでよい。以降の変更はpersist()側でDOMに反映する。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (next: ThemePrefs) => {
    setPrefs(next);
    applyToDocument(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorageが使えない環境(プライベートモード等)は無視してよい
    }
    // TODO: ログイン中であれば、ここでSupabaseのusersテーブルにも保存する
    // await supabase.from("users").update({ theme_mode: next.mode, theme_color: next.accent }).eq("id", userId);
  };

  const value: ThemeContextValue = {
    ...prefs,
    setMode: (mode) => persist({ ...prefs, mode }),
    setAccent: (accent) => persist({ ...prefs, accent }),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() は <ThemeProvider> の内側で使ってください");
  return ctx;
}
