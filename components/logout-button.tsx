"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh(); // Header(サーバーコンポーネント)の認証状態を再取得させる
  }

  return (
    <button
      onClick={handleLogout}
      className="text-[13px] text-ink-sub hover:text-accent"
    >
      ログアウト
    </button>
  );
}
