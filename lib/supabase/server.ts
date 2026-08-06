import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバーコンポーネント / Route Handler / Server Action から使うSupabaseクライアント。
 * Cookieベースでログインセッションを引き継ぐ。
 * 使い方: const supabase = await createClient();
 */
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // ここが空だと、Supabase側では原因不明の
    // "No API key found in request" というエラーになって分かりにくいため、
    // ここで先に分かりやすいエラーを出す。
    throw new Error(
      "Supabaseの環境変数が設定されていません。プロジェクト直下に .env.local を作成し、" +
        "NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定したうえで " +
        "開発サーバーを再起動してください（.env.local.example を参照）。" +
        "本番(Vercel)の場合はEnvironment Variablesに設定後、再デプロイが必要です。"
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Componentから呼ばれた場合はここに来るが、
          // middlewareでセッションを更新していれば問題ない
        }
      },
    },
  });
}
