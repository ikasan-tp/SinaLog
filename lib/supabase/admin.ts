import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * service_role キーを使った管理者権限クライアント。
 * auth.users の完全削除など、通常のRLSでは行えない操作にのみ使う。
 *
 * SUPABASE_SERVICE_ROLE_KEY は「NEXT_PUBLIC_」を付けないこと
 * （付けるとブラウザに露出してしまう、絶対にサーバー側専用の秘密鍵）。
 * Supabaseダッシュボード > Project Settings > API > service_role で取得できる。
 *
 * このキーが未設定でも他の機能は問題なく動く。未設定の場合は
 * createAdminClient() が null を返すので、呼び出し側で
 * 「完全なアカウント削除は使えない」ケースとしてフォールバックすること。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
