import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { ELEMENT_TO_CATEGORY } from "@/lib/content-taxonomy";
import { ReviewList } from "./review-list";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ registered?: string; reviewed?: string }>;
};

const DIFFICULTY_LABEL: Record<string, string> = { easy: "優しい", normal: "普通", severe: "シビア" };
const LOAD_LABEL: Record<string, string> = { light: "軽い", normal: "普通", heavy: "重い" };
const COMBAT_LABEL: Record<string, string> = { none: "ほぼ無い", light: "軽め", heavy: "激しめ" };

export default async function ScenarioDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { registered, reviewed } = await searchParams;

  const supabase = await createClient();

  const [{ data: scenario }, { data: stats }, { data: elementCounts }, { data: reviews }] =
    await Promise.all([
      supabase.from("scenarios").select("*").eq("id", id).eq("is_hidden", false).single(),
      supabase.from("scenario_stats").select("*").eq("scenario_id", id).maybeSingle(),
      supabase
        .from("scenario_element_counts")
        .select("*")
        .eq("scenario_id", id)
        .order("count", { ascending: false })
        .limit(12),
      supabase
        .from("reviews")
        .select(
          "id, role, play_format, modification, recommend, good_point, concern_point, spoiler_text, helpful_count, created_at, users(display_name, avatar_icon, avatar_color)"
        )
        .eq("scenario_id", id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false }),
    ]);

  if (!scenario) notFound();

  const reviewCount = stats?.review_count ?? 0;
  const recommendPct = stats?.recommend_pct ?? null;

  // カテゴリごとに要素タグ件数をまとめ直す
  const groupedElements = new Map<string, { element: string; count: number }[]>();
  for (const row of elementCounts ?? []) {
    const category = ELEMENT_TO_CATEGORY[row.element] ?? "その他";
    if (!groupedElements.has(category)) groupedElements.set(category, []);
    groupedElements.get(category)!.push(row);
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {registered && <Banner>シナリオを登録しました</Banner>}
        {reviewed && <Banner>レビューを投稿しました</Banner>}

        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          <div className="relative h-[180px] bg-gradient-to-br from-[#3A2E33] to-[#241C22]">
            {scenario.system_version && (
              <span className="absolute left-5 top-5 rounded bg-white/90 px-2.5 py-1 text-[11px] text-tag-ink">
                {scenario.system_version}
              </span>
            )}
          </div>

          <div className="p-8">
            <h1 className="mb-1.5 text-2xl font-bold">{scenario.title}</h1>
            <p className="mb-5 text-[13px] text-ink-sub">
              {scenario.author_name && <>作者：{scenario.author_name}　</>}
              頒布：
              <a href={scenario.distribution_url} target="_blank" rel="noreferrer" className="text-link underline">
                頒布ページを見る
              </a>
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              {scenario.recommended_players && <Pill>推奨PL {scenario.recommended_players}</Pill>}
              {scenario.play_time && <Pill>プレイ時間 {scenario.play_time}</Pill>}
              <Pill>価格 {scenario.price_text}</Pill>
              {scenario.setting && <Pill>{scenario.setting}</Pill>}
              {scenario.required_supplements?.length === 0 && <Pill>サプリ不要（ルールブックのみ）</Pill>}
            </div>

            {scenario.description && (
              <p className="mb-6 whitespace-pre-line border-t border-line pt-5 text-sm leading-relaxed">
                {scenario.description}
              </p>
            )}

            {/* おすすめ度サマリー */}
            {reviewCount > 0 ? (
              <div className="mb-5 grid grid-cols-[160px_1fr] items-center gap-7 rounded-lg bg-bg p-6 max-sm:grid-cols-1">
                <div className="text-center">
                  <div className="mb-1.5 flex justify-center text-ok">
                    <ThumbUpIcon />
                  </div>
                  <div className="text-4xl font-bold text-ok">{recommendPct ?? 0}%</div>
                  <div className="mt-1 text-xs text-ink-sub">がおすすめと回答</div>
                  <div className="mt-1.5 text-[11px] text-ink-faint">
                    レビュー{reviewCount}件（おすすめ{stats?.recommend_count ?? 0}）
                  </div>
                </div>
                <div className="space-y-2.5">
                  {stats?.top_exploration_difficulty && (
                    <FeatureBadge label="探索の難しさ" value={DIFFICULTY_LABEL[stats.top_exploration_difficulty]} />
                  )}
                  {stats?.top_kp_or_pc_load && (
                    <FeatureBadge label="進行・操作の負担" value={LOAD_LABEL[stats.top_kp_or_pc_load]} />
                  )}
                  {stats?.top_combat_intensity && (
                    <FeatureBadge label="戦闘の激しさ" value={COMBAT_LABEL[stats.top_combat_intensity]} />
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-5 rounded-lg border border-dashed border-line-strong bg-bg p-6 text-center text-[13px] text-ink-faint">
                まだレビューがありません。最初のレビューを投稿してみませんか？
              </div>
            )}

            {/* 要素タグ集計 */}
            {groupedElements.size > 0 && (
              <div className="mb-5 rounded-lg border border-[#D8B98E] bg-[#FBF3E7] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#8A5A1E]">
                  プレイ前に知っておきたい要素（レビュアーの回答にもとづく集計・ネタバレを含む可能性があります）
                </div>
                <div className="space-y-2">
                  {Array.from(groupedElements.entries()).map(([category, items]) => (
                    <div key={category} className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[#F1DFC0] px-2 py-0.5 text-[10.5px] font-bold text-[#8A5A1E]">
                        {category}
                      </span>
                      {items.map((it) => (
                        <span
                          key={it.element}
                          className="rounded-full border border-[#D8B98E] bg-white px-2.5 py-1 text-[11px] text-[#8A5A1E]"
                        >
                          {it.element}
                          <i className="ml-0.5 not-italic text-[#B08040]">({it.count})</i>
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* レビュー一覧 */}
            <div className="mb-3 flex items-center justify-between border-t border-line pt-5">
              <h2 className="text-sm font-bold">レビュー</h2>
              <Link
                href={`/scenarios/${scenario.id}/review/new`}
                className="rounded-md bg-accent px-4 py-2 text-xs text-white hover:bg-accent-hover"
              >
                レビューを投稿する
              </Link>
            </div>

            <ReviewList reviews={normalizeReviews(reviews)} scenarioId={scenario.id} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Supabaseの型推論では1:1のはずのリレーションも配列型になることがあるため、
// 表示側に渡す前に正規化しておく。
function normalizeReviews(rows: Record<string, unknown>[] | null) {
  return (rows ?? []).map((row) => ({
    ...row,
    users: Array.isArray(row.users) ? (row.users[0] ?? null) : row.users,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any;
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg border border-ok-bg bg-ok-bg px-4 py-3 text-[13px] text-ok">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-tag-bg px-3 py-1.5 text-xs text-tag-ink">{children}</span>;
}

function FeatureBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 rounded-md border border-line bg-panel px-3.5 py-2.5 text-[12.5px]">
      <span className="w-[110px] flex-shrink-0 text-ink-faint">{label}</span>
      <span className="font-bold text-accent">{value}</span>
    </div>
  );
}

function ThumbUpIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}
