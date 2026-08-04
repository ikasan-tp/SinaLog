import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "./review-form";

type Props = { params: Promise<{ id: string }> };

export default async function NewReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/scenarios/${id}/review/new`);
  }

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("id, title, author_name, has_combat, price_text")
    .eq("id", id)
    .single();

  if (!scenario) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="mb-1.5 text-xl font-bold">レビューを投稿する</h1>
        <p className="mb-7 text-[13px] text-ink-sub">
          実際にプレイした内容をもとに、これから遊ぶ人の参考になる感想を書いてください。
        </p>
        <ReviewForm scenario={scenario} />
      </main>
      <Footer />
    </>
  );
}
