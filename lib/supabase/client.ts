import { createBrowserClient } from "@supabase/ssr";

/**
 * クライアントコンポーネント(ブラウザ側)から使うSupabaseクライアント。
 * 使い方: const supabase = createClient();
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
