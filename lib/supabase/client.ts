import { createBrowserClient } from "@supabase/ssr";

/**
 * クライアントコンポーネント(ブラウザ側)から使うSupabaseクライアント。
 * 使い方: const supabase = createClient();
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // ここが空だと、Supabase側では原因不明の
    // "No API key found in request" というエラーになって分かりにくいため、
    // ここで先に分かりやすいエラーを出す。
    throw new Error(
      "Supabaseの環境変数が設定されていません。プロジェクト直下に .env.local を作成し、" +
        "NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定したうえで " +
        "開発サーバーを再起動してください（.env.local.example を参照）。"
    );
  }

  return createBrowserClient(url, anonKey);
}
