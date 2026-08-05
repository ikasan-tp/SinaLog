import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { LogoutButton } from "./logout-button";

export async function Header() {
  const { isConfigured } = getSupabaseConfig();
  const user = isConfigured
    ? (await (await createClient()).auth.getUser()).data.user
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-panel">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-7 px-6">
        <Link href="/" className="text-[17px] font-bold text-ink">
          Sina<span className="text-accent">log</span>
        </Link>

        <div className="hidden max-w-[420px] flex-1 md:flex">
          <input
            type="text"
            placeholder="シナリオ名・作者名で検索"
            className="w-full rounded-l-md border border-line-strong bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <button className="rounded-r-md border border-l-0 border-line-strong px-4 text-sm text-ink-sub">
            検索
          </button>
        </div>

        <div className="ml-auto flex items-center gap-5">
          {user ? (
            <>
              <Link href="/mypage" className="text-[13px] text-ink-sub hover:text-accent">
                マイページ
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-accent px-4 py-2 text-[13px] text-white hover:bg-accent-hover"
            >
              ログイン / 新規登録
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
