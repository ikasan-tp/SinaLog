import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Google OAuth・メールMagic Linkの両方が、認証完了後にここへリダイレクトされる。
 * URLの ?code= を実際のログインセッションに交換し、元いたページ(next)へ戻す。
 *
 * 設定箇所:
 * - Supabaseダッシュボード > Authentication > URL Configuration の
 *   Redirect URLs に `https://<本番ドメイン>/auth/callback` を登録しておくこと
 */

/**
 * next パラメータはURLクエリから来る = 利用者が自由に書き換えられる値なので、
 * そのまま外部サイトへのリダイレクトに使うとオープンリダイレクト脆弱性になる。
 * 同一オリジンの相対パス("/"始まりで"//"や"/\"ではないもの)だけを許可する。
 */
function sanitizeNext(next: string | null): string {
  if (!next) return "/mypage";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/mypage";
  }
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 失敗した場合はログイン画面にエラー付きで戻す
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
