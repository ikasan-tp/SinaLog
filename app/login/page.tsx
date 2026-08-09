"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * next パラメータは利用者が自由に書き換えられるクエリ値のため、
 * そのままログイン後リダイレクト先に使うとオープンリダイレクト脆弱性になる。
 * 同一オリジンの相対パスだけを許可する(auth/callback/route.tsのsanitizeNextと同じ方針)。
 */
function sanitizeNext(next: string | null): string {
  if (!next) return "/mypage";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/mypage";
  }
  return next;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const next = sanitizeNext(searchParams.get("next"));

  const redirectBase =
    typeof window !== "undefined" ? window.location.origin : "";

  async function handleGoogleLogin() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectBase}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    }
    // 成功時はSupabaseがGoogleの認証画面へ自動遷移させる
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectBase}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" className="text-[17px] font-bold text-ink">
            Sina<span className="text-accent">Log</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[380px] text-pretty rounded-xl border border-line bg-panel p-9">
          {status !== "sent" ? (
            <>
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-bg text-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h1 className="mb-1.5 text-center text-[19px] font-bold">
                SinaLogへようこそ
              </h1>
              <p className="mb-6 text-center text-[12.5px] leading-relaxed text-ink-sub">
                ログインすると、レビューの投稿や閲覧履歴の確認ができます。初めての方も同じ方法で登録されます。
              </p>

              <button
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-2.5 rounded-md border border-line-strong bg-panel py-3 text-sm text-ink hover:bg-bg"
              >
                <GoogleIcon />
                Googleで続ける
              </button>

              <div className="my-5 flex items-center gap-3 text-[11px] text-ink-faint">
                <span className="h-px flex-1 bg-line" />
                または
                <span className="h-px flex-1 bg-line" />
              </div>

              <form onSubmit={handleMagicLink}>
                <label className="mb-1.5 block text-xs font-medium">
                  メールアドレスで続ける
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mb-3 w-full rounded-md border border-line-strong px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-md bg-ink py-3 text-[13.5px] text-white disabled:opacity-60"
                >
                  {status === "sending" ? "送信中…" : "ログイン用リンクを送る"}
                </button>
                <p className="mt-2.5 text-center text-[11px] text-ink-faint">
                  パスワードは不要です。届いたメール内のリンクを開くだけでログインできます。
                </p>
              </form>

              {status === "error" && (
                <p className="mt-3 text-center text-[11px] text-accent">
                  送信に失敗しました：{errorMessage}
                </p>
              )}

              <p className="mt-5 text-center text-[11px] leading-relaxed text-ink-faint">
                続けることで
                <Link href="/terms" className="text-link underline">
                  利用規約
                </Link>
                および
                <Link href="/terms#privacy" className="text-link underline">
                  プライバシーポリシー
                </Link>
                に同意したものとみなされます。
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ok-bg text-ok">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2 className="mb-2 text-base font-bold">メールを送信しました</h2>
              <p className="text-[12.5px] leading-relaxed text-ink-sub">
                {email}{" "}
                宛に、ログイン用のリンクを送信しました。メールを開いてリンクをクリックすると、ログインが完了します。
              </p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink-sub">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-line px-6 py-6 text-center text-[11px] text-ink-faint">
        SinaLog── クトゥルフ神話TRPGシナリオレビューサイト
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
