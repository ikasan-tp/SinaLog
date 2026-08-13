import { notFound } from "next/navigation";
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

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("id, title, author_name, has_combat, is_free")
    .eq("id", id)
    .single();

  if (!scenario) notFound();

  const { data: existingReview } = user
    ? await supabase
        .from("reviews")
        .select(
          "role, play_format, group_recruitment, recommend, modification, modification_details, modification_advice, exploration_difficulty, combat_intensity, kp_or_pc_load, replay_intention, group_dependency, session_note, content_warning_adequacy, homage_answer, homage_note, ai_usage_answer, price_fairness, good_point, concern_point, spoiler_text, contains_spoiler, elements, tags"
        )
        .eq("scenario_id", id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="mb-1.5 text-xl font-bold">
          {existingReview ? "レビューを編集する" : "レビューを投稿する"}
        </h1>
        <p className="mb-7 text-[13px] text-ink-sub">
          {existingReview
            ? "投稿済みのレビューを編集します。保存すると内容が上書きされます。"
            : user
              ? "実際にプレイした内容をもとに、これから遊ぶ人の参考になる感想を書いてください。"
              : "実際にプレイした内容をもとに、これから遊ぶ人の参考になる感想を書いてください。ログインなしで匿名（匿名さん）として投稿できます。ログインすると後から編集・削除もできます。"}
        </p>
        <ReviewForm scenario={scenario} existingReview={existingReview} />
      </main>
      <Footer />
    </>
  );
}
