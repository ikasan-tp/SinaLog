import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { MobileSearchToggle } from "./mobile-search-toggle";
import { SearchForm } from "./search-form";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-panel">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-7 px-6">
        <Link href="/" className="text-[17px] font-bold text-ink">
          Sina<span className="text-accent">Log</span>
        </Link>

        {/* デスクトップ幅ではヘッダー内に検索欄を表示する */}
        <SearchForm className="hidden max-w-[420px] flex-1 md:flex" />

        <Link
          href="/scenarios/new"
          className="hidden flex-shrink-0 text-[13px] text-ink-sub hover:text-accent md:inline"
        >
          シナリオを登録
        </Link>

        <div className="ml-auto flex items-center gap-4">
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

          {/* スマホ幅では検索欄をハンバーガーメニューに格納する */}
          <MobileSearchToggle />
        </div>
      </div>
    </header>
  );
}
