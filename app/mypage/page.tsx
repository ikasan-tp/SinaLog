import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

// TODO: /mnt/user-data/outputs/mypage.html のデザインをここに移植する。
// デザイントークン(色・余白・タイポグラフィ)はglobals.cssに定義済みなので、
// Tailwindのユーティリティクラス(bg-panel, text-ink-sub 等)でそのまま再現できる。
//
// 認証ガードの実装例:
// 未ログインならログイン画面へ飛ばす。ログイン後に元のページへ戻れるよう
// ?next= にこのページのパスを付けている。

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/mypage");
  }

  // ここまで来ればログイン済み。プロフィールはpublic.usersから取得する。
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="mb-2 text-xl font-bold">マイページ</h1>
        <p className="mb-4 text-sm text-ink-sub">
          ログイン中：{profile?.display_name ?? user.email}
        </p>
        <p className="text-sm text-ink-faint">
          未実装（mypage.html を移植してください）
        </p>
      </main>
      <Footer />
    </>
  );
}
