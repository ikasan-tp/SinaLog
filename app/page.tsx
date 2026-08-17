import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScenarioThumbnail } from "@/components/scenario-thumbnail";
import { priceLabel as formatPriceLabel } from "@/lib/price";
import { createClient } from "@/lib/supabase/server";

type ScenarioCardData = {
  id: string;
  title: string;
  description: string | null;
  system_version: string | null;
  recommended_players: string | null;
  play_time_text: string | null;
  is_free: boolean | null;
  price_yen: number | null;
  author_name: string | null;
  thumbnail_url: string | null;
};

const scenarioColumns =
  "id, title, description, system_version, recommended_players, play_time_text, is_free, price_yen, author_name, thumbnail_url";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ログイン中で「好きな傾向」タグが設定されていれば、そのタグと重なるシナリオを「あなたにおすすめ」として出す
  let tasteTags: string[] = [];
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("taste_tags")
      .eq("id", user.id)
      .maybeSingle();
    tasteTags = profile?.taste_tags ?? [];
  }

  const [
    { data: newScenarios, error: newScenariosError },
    { data: statsRows },
    { count: scenarioCount },
    { count: reviewCount },
  ] = await Promise.all([
    supabase
      .from("scenarios")
      .select(scenarioColumns)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(8),
    // 人気シナリオ: おすすめ率が高い順(scenario_statsビュー)
    supabase
      .from("scenario_stats")
      .select("scenario_id, recommend_pct, review_count")
      .order("recommend_pct", { ascending: false })
      .limit(8),
    supabase.from("scenarios").select("id", { count: "exact", head: true }).eq("is_hidden", false),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_hidden", false),
  ]);

  // シナリオ一覧の取得に失敗した場合(未適用のマイグレーションで列が無い等)、
  // 件数カウントだけ成功して一覧が0件に見える、という分かりにくい状態を避けるためログに残す。
  if (newScenariosError) {
    console.error("トップページ: シナリオ一覧の取得に失敗しました。マイグレーションが最新か確認してください。", newScenariosError);
  }

  const popularIds = (statsRows ?? []).map((s) => s.scenario_id);
  const { data: popularScenariosRaw } =
    popularIds.length > 0
      ? await supabase.from("scenarios").select(scenarioColumns).in("id", popularIds).eq("is_hidden", false)
      : { data: [] as ScenarioCardData[] };
  // scenario_statsの順序(おすすめ率順)を保って並べ直す
  const popularScenarios = popularIds
    .map((id) => (popularScenariosRaw ?? []).find((s) => s.id === id))
    .filter((s): s is ScenarioCardData => !!s);

  const hasTasteTags = tasteTags.length > 0;
  const { data: recommendedForYouRaw } = hasTasteTags
    ? await supabase
        .from("scenarios")
        .select(scenarioColumns)
        .eq("is_hidden", false)
        .overlaps("tags", tasteTags)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: null };
  // 好きな傾向タグが未設定、または一致するシナリオが無い場合は、新着シナリオで埋めておく
  // (「あなたにおすすめ」欄を常に表示するための代替表示)
  const recommendedForYou =
    recommendedForYouRaw && recommendedForYouRaw.length > 0 ? recommendedForYouRaw : newScenarios ?? [];

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {/* ヒーロー */}
        <section className="mb-6 rounded-xl border border-line bg-panel px-7 py-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">
            Sina<span className="text-accent">Log</span>
          </h1>
          <p className="mb-4 text-[12.5px] text-ink-sub">
            クトゥルフ神話TRPGシナリオのレビューサイト。実際に遊んだ人の声で、次に遊ぶ一本を選べます。
          </p>
          <div className="flex justify-center gap-6 text-[12px] text-ink-faint">
            <span>
              登録シナリオ <strong className="text-ink">{scenarioCount ?? 0}</strong>本
            </span>
            <span>
              投稿レビュー <strong className="text-ink">{reviewCount ?? 0}</strong>件
            </span>
          </div>
        </section>

        {/* SinaLogについて・ご利用にあたって: レビュー一覧の妨げにならないよう控えめな3行にまとめる */}
        <p className="mb-10 text-center text-[11px] leading-relaxed text-ink-faint">
          クトゥルフ神話TRPG・新クトゥルフ神話TRPGの同人シナリオを対象にした非公式ファンサイトです。
          <br />
          ネタバレを含む場合があります。掲載内容の正確性は保証していません。
          <br />
          お問い合わせは
          <Link href="/contact" className="underline hover:text-ink-sub">
            お問い合わせフォーム
          </Link>
          へ。詳しくは
          <Link href="/help" className="underline hover:text-ink-sub">
            ヘルプ
          </Link>
          をご覧ください。
        </p>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">あなたにおすすめ</h2>
          <span className="text-[11px] text-ink-faint">
            {hasTasteTags ? "好きな傾向タグをもとに表示" : "新着シナリオを表示中"}
          </span>
        </div>
        <ScenarioSection scenarios={recommendedForYou} emptyMessage="登録されているシナリオはありません" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">人気シナリオ</h2>
          <span className="text-[11px] text-ink-faint">おすすめ率順</span>
        </div>
        <ScenarioSection
          scenarios={popularScenarios}
          emptyMessage="まだレビューが投稿されたシナリオがありません"
        />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">新着シナリオ</h2>
          <Link href="/search" className="text-[11.5px] text-link underline hover:text-accent">
            シナリオをもっと探す
          </Link>
        </div>
        <ScenarioSection scenarios={newScenarios ?? []} emptyMessage="登録されているシナリオはありません" />
      </main>

      <Footer />
    </>
  );
}

function ScenarioSection({
  scenarios,
  emptyMessage,
}: {
  scenarios: ScenarioCardData[];
  emptyMessage: string;
}) {
  if (scenarios.length === 0) {
    return (
      <div className="mb-10 rounded-xl border border-dashed border-line-strong bg-bg p-8 text-center text-[13px] text-ink-faint">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {scenarios.map((scenario) => (
        <ScenarioCard key={scenario.id} scenario={scenario} />
      ))}
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: ScenarioCardData }) {
  const priceLabel = formatPriceLabel(scenario.is_free, scenario.price_yen);
  return (
    <Link
      href={`/scenarios/${scenario.id}`}
      className="rounded-xl border border-line bg-panel transition-shadow hover:shadow-md"
    >
      <ScenarioThumbnail src={scenario.thumbnail_url} className="relative h-[120px] rounded-t-xl">
        {scenario.system_version && (
          <span className="absolute left-2.5 top-2.5 rounded bg-white/90 px-2 py-0.5 text-[10px] text-tag-ink">
            {scenario.system_version}
          </span>
        )}
      </ScenarioThumbnail>
      <div className="p-3.5">
        <div className="mb-1.5 text-sm font-bold">{scenario.title}</div>
        {scenario.description && (
          <p className="mb-2.5 line-clamp-2 text-xs text-ink-sub">{scenario.description}</p>
        )}
        <div className="flex gap-2.5 text-[11px] text-ink-faint">
          {scenario.recommended_players && <span>PL {scenario.recommended_players}</span>}
          {scenario.play_time_text && <span>{scenario.play_time_text}</span>}
          <span>{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
}
