"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

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
 *   1. ログイン中: Supabaseの users.theme_mode / users.theme_color
 *   2. 未ログイン: localStorage
 *
 * ログイン中はマウント時にDBの値を読み込んでlocalStorageより優先し、
 * 変更時はlocalStorageとDBの両方に書き込む(DBはfire-and-forget、失敗しても
 * 表示上のテーマ切り替え自体は成功させる)。
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
  const userIdRef = useRef<string | null>(null);

  // マウント時点でDOMへ反映しておく(layout.tsxのインラインscriptで
  // 初回ペイント前には近い状態になっているが、React側の状態とも同期させる)
  // ログイン中なら、続けてDB側の設定を読み込んでlocalStorageより優先する。
  useEffect(() => {
    applyToDocument(prefs);

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      userIdRef.current = user.id;

      const { data } = await supabase
        .from("users")
        .select("theme_mode, theme_color")
        .eq("id", user.id)
        .single();

      if (data) {
        const next: ThemePrefs = {
          mode: (data.theme_mode as ThemeMode) ?? DEFAULT_PREFS.mode,
          accent: (data.theme_color as AccentColor) ?? DEFAULT_PREFS.accent,
        };
        setPrefs(next);
        applyToDocument(next);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // localStorageが使えない環境(プライベートモード等)は無視してよい
        }
      }
    })();
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

    if (userIdRef.current) {
      const supabase = createClient();
      supabase
        .from("users")
        .update({ theme_mode: next.mode, theme_color: next.accent })
        .eq("id", userIdRef.current)
        .then(({ error }) => {
          if (error) console.error("テーマ設定の保存に失敗しました:", error);
        });
    }
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
