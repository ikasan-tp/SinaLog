import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバーコンポーネント / Route Handler / Server Action から使うSupabaseクライアント。
 * Cookieベースでログインセッションを引き継ぐ。
 * 使い方: const supabase = await createClient();
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );
}
