import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { AvatarPickerForm } from "./avatar-picker-form";

export default async function AvatarPickerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/mypage/avatar");

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, avatar_icon, avatar_color")
    .eq("id", user.id)
    .single();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-6">
        <p className="mb-3 text-xs text-ink-faint">
          <Link href="/mypage" className="hover:text-accent">
            マイページ
          </Link>{" "}
          ＞ アイコンを選ぶ
        </p>
        <h1 className="mb-1.5 text-xl font-bold">プロフィールアイコン</h1>
        <p className="mb-7 text-pretty text-[13px] text-ink-sub">
          好きなアイコンと色の組み合わせを選んでください。文字アバターの代わりにマイページ・レビューで表示されます。
        </p>

        <AvatarPickerForm
          displayName={profile?.display_name ?? "ユーザー"}
          initialIcon={profile?.avatar_icon ?? "cat"}
          initialColor={profile?.avatar_color ?? "#2E6B6B"}
        />
      </main>
      <Footer />
    </>
  );
}
