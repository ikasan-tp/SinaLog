import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { ScenarioForm } from "@/app/scenarios/new/scenario-form";
import { findPlayTimeRangeKeyByMinutes } from "@/lib/play-time";

export default async function EditScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/scenarios/${id}/edit`);
  }

  const { data: scenario } = await supabase
    .from("scenarios")
    .select(
      "id, title, author_name, circle_name, distribution_url, is_free, price_yen, system_version, setting, recommended_players, play_time_text, play_time_min_minutes, play_time_max_minutes, has_combat, word_count, loss_rate, required_skills, recommended_skills, rollable_skills, discouraged, description, description_is_quoted, thumbnail_url, tags, required_supplements, registered_by"
    )
    .eq("id", id)
    .single();

  if (!scenario) notFound();

  if (scenario.registered_by !== user.id) {
    redirect(`/scenarios/${id}`);
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="mb-1.5 text-xl font-bold">シナリオ情報を編集</h1>
        <p className="mb-7 text-[13px] text-ink-sub">「{scenario.title}」の登録情報を編集します。</p>
        <ScenarioForm
          mode="edit"
          scenarioId={scenario.id}
          initialValues={{
            title: scenario.title ?? "",
            authorName: scenario.author_name ?? "",
            circleName: scenario.circle_name ?? "",
            distributionUrl: scenario.distribution_url ?? "",
            isFree: scenario.is_free ?? true,
            priceYen: scenario.price_yen ?? null,
            systemVersion: scenario.system_version ?? "",
            setting: scenario.setting ?? "",
            recommendedPlayers: scenario.recommended_players ?? "",
            playTimeText: scenario.play_time_text ?? "",
            playTimeRangeKey: findPlayTimeRangeKeyByMinutes(
              scenario.play_time_min_minutes,
              scenario.play_time_max_minutes
            ),
            hasCombat: scenario.has_combat ?? false,
            wordCount: scenario.word_count ?? null,
            lossRate: scenario.loss_rate ?? "",
            requiredSkills: scenario.required_skills ?? "",
            recommendedSkills: scenario.recommended_skills ?? "",
            rollableSkills: scenario.rollable_skills ?? "",
            discouraged: scenario.discouraged ?? "",
            description: scenario.description ?? "",
            descriptionIsQuoted: scenario.description_is_quoted ?? false,
            thumbnailUrl: scenario.thumbnail_url ?? "",
            tags: scenario.tags ?? [],
            requiredSupplements: scenario.required_supplements ?? [],
          }}
        />
      </main>
      <Footer />
    </>
  );
}
