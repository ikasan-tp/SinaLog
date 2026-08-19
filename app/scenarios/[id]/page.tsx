import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FavoriteButton } from "@/components/favorite-button";
import { ScenarioThumbnail } from "@/components/scenario-thumbnail";
import { CollapsibleTagGroup } from "@/components/collapsible-tag-group";
import { createClient } from "@/lib/supabase/server";
import { ELEMENT_TO_CATEGORY, SENSITIVE_TAGS } from "@/lib/content-taxonomy";
import { ReviewList } from "./review-list";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ registered?: string; reviewed?: string; updated?: string }>;
};

const DIFFICULTY_LABEL: Record<string, string> = { easy: "優しい", normal: "普通", severe: "シビア" };
const LOAD_LABEL: Record<string, string> = { light: "軽い", normal: "普通", heavy: "重い" };
const COMBAT_LABEL: Record<string, string> = { none: "ほぼ無い", light: "軽め", heavy: "激しめ" };

// SNS等でシェアされた際、シナリオ名とSinaLogのブランド名が両方表示されるようにする
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: scenario } = await supabase
    .from("scenarios")
    .select("title, description, author_name, circle_name")
    .eq("id", id)
    .eq("is_hidden", false)
    .maybeSingle();

  if (!scenario) return { title: "シナリオが見つかりません" };

  const author = scenario.circle_name || scenario.author_name;
  const description =
    scenario.description?.slice(0, 120) ||
    `${author ? `${author}の` : ""}クトゥルフ神話TRPGシナリオ「${scenario.title}」のレビューをSinaLogで見る。`;

  return {
    title: scenario.title,
    description,
    openGraph: { title: scenario.title, description },
    twitter: { title: scenario.title, description },
  };
}

export default async function ScenarioDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { registered, reviewed, updated } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          "id, user_id, role, play_format, group_recruitment, modification, recommend, good_point, concern_point, spoiler_text, contains_spoiler, helpful_count, created_at, users(display_name, avatar_icon, avatar_color)"
        )
        .eq("scenario_id", id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false }),
    ]);

  if (!scenario) notFound();

  const reviewIds = (reviews ?? []).map((r) => r.id);

  // ログイン中のユーザーが「参考になった」「シナリオ以外の要因」を
  // 既に押しているレビューを取得(ボタンの見た目を正しい状態にするため)
  let myHelpfulVotes = new Set<string>();
  let myContextFlags = new Set<string>();
  if (user && reviewIds.length > 0) {
    const [{ data: helpfulRows }, { data: flagRows }] = await Promise.all([
      supabase
        .from("review_helpful_votes")
        .select("review_id")
        .eq("voter_id", user.id)
        .in("review_id", reviewIds),
      supabase
        .from("review_context_flags")
        .select("review_id")
        .eq("user_id", user.id)
        .in("review_id", reviewIds),
    ]);
    myHelpfulVotes = new Set((helpfulRows ?? []).map((r) => r.review_id));
    myContextFlags = new Set((flagRows ?? []).map((r) => r.review_id));
  }

  // 「シナリオ以外の要因が大きそう」の件数(誰でも見られる集計。通報とは別物)
  const contextFlagCounts = new Map<string, number>();
  if (reviewIds.length > 0) {
    const { data: flagCountRows } = await supabase
      .from("review_context_flags")
      .select("review_id")
      .in("review_id", reviewIds);
    for (const row of flagCountRows ?? []) {
      contextFlagCounts.set(row.review_id, (contextFlagCounts.get(row.review_id) ?? 0) + 1);
    }
  }

  const enrichedReviews = (reviews ?? []).map((r) => ({
    ...r,
    isOwnReview: user?.id === r.user_id,
    myVote: myHelpfulVotes.has(r.id),
    myContextFlag: myContextFlags.has(r.id),
    contextFlagCount: contextFlagCounts.get(r.id) ?? 0,
  }));

  // ログイン中のみ必要な情報(自分のお気に入り状態・自分のレビュー有無・登録者本人か)
  let isFavorited = false;
  let hasOwnReview = false;
  if (user) {
    const [{ data: favorite }, { data: ownReview }] = await Promise.all([
      supabase
        .from("favorites")
        .select("scenario_id")
        .eq("user_id", user.id)
        .eq("scenario_id", id)
        .maybeSingle(),
      supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("scenario_id", id)
        .maybeSingle(),
    ]);
    isFavorited = !!favorite;
    hasOwnReview = !!ownReview;
  }

  const reviewCount = stats?.review_count ?? 0;
  const recommendPct = stats?.recommend_pct ?? null;

  // カテゴリごとに要素タグ件数をまとめ直す
  const groupedElements = new Map<string, { element: string; count: number }[]>();
  for (const row of elementCounts ?? []) {
    const category = ELEMENT_TO_CATEGORY[row.element] ?? "その他";
    if (!groupedElements.has(category)) groupedElements.set(category, []);
    groupedElements.get(category)!.push(row);
  }

  // 登録者が付けたタグを、通常タグとセンシティブ要素に振り分ける
  const sensitiveSet = new Set(SENSITIVE_TAGS);
  const normalTags = (scenario.tags ?? []).filter((t: string) => !sensitiveSet.has(t));
  const sensitiveTags = (scenario.tags ?? []).filter((t: string) => sensitiveSet.has(t));

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {registered && <Banner>シナリオを登録しました</Banner>}
        {reviewed && <Banner>レビューを投稿しました</Banner>}
        {updated && <Banner>更新しました</Banner>}

        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          <ScenarioThumbnail src={scenario.thumbnail_url} className="h-[180px]">
            {scenario.system_version && (
              <span className="absolute left-5 top-5 rounded bg-white/90 px-2.5 py-1 text-[11px] text-tag-ink">
                {scenario.system_version}
              </span>
            )}
          </ScenarioThumbnail>

          <div className="p-8">
            <div className="mb-1.5 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-bold">{scenario.title}</h1>
              <div className="flex flex-shrink-0 gap-2">
                <FavoriteButton scenarioId={scenario.id} isLoggedIn={!!user} initialFavorited={isFavorited} />
                {user && (
                  <Link
                    href={`/scenarios/${scenario.id}/edit`}
                    className="flex items-center rounded-md border border-line-strong px-4 py-2 text-xs text-ink-sub hover:bg-bg"
                  >
                    情報を編集
                  </Link>
                )}
              </div>
            </div>
            <p className="mb-5 text-[13px] text-ink-sub">
              {scenario.author_name && <>作者：{scenario.author_name}　</>}
              頒布：
              <a href={scenario.distribution_url} target="_blank" rel="noreferrer" className="text-link underline">
                頒布ページを見る
              </a>
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              {scenario.recommended_players && <Pill>推奨PL {scenario.recommended_players}</Pill>}
              {scenario.play_time_text && <Pill>プレイ時間 {scenario.play_time_text}</Pill>}
              <Pill>{scenario.is_free === false ? `価格 ${scenario.price_yen ?? "?"}円` : "価格 無料"}</Pill>
              {scenario.setting && <Pill>{scenario.setting}</Pill>}
              {scenario.required_supplements?.length === 0 && <Pill>サプリ不要（ルールブックのみ）</Pill>}
            </div>

            {/* 基本情報: プレイ人数・プレイ時間などと並ぶ、シナリオを選ぶ上で重要な情報。タグより優先して常時表示する。 */}
            {(scenario.loss_rate ||
              scenario.required_skills ||
              scenario.recommended_skills ||
              scenario.rollable_skills ||
              scenario.discouraged) && (
              <div className="mb-6 space-y-2 border-t border-line pt-5">
                {scenario.loss_rate && <BasicInfoRow label="ロスト率" value={scenario.loss_rate} />}
                {scenario.required_skills && <BasicInfoRow label="必須技能" value={scenario.required_skills} />}
                {scenario.recommended_skills && (
                  <BasicInfoRow label="推奨技能" value={scenario.recommended_skills} />
                )}
                {scenario.rollable_skills && (
                  <BasicInfoRow label="準推奨技能" value={scenario.rollable_skills} />
                )}
                {scenario.discouraged && <BasicInfoRow label="非推奨" value={scenario.discouraged} />}
              </div>
            )}

            {scenario.description && (
              <div className="mb-6 border-t border-line pt-5">
                {scenario.description_is_quoted && (
                  <span className="mb-2 inline-block rounded bg-tag-bg px-2 py-0.5 text-[10.5px] text-tag-ink">
                    頒布ページより引用
                  </span>
                )}
                <p className="whitespace-pre-line text-sm leading-relaxed">{scenario.description}</p>
              </div>
            )}

            {/* タグはネタバレになり得る情報のため、初期状態では隠しておく */}
            {(normalTags.length > 0 || sensitiveTags.length > 0) && (
              <div className="mb-5">
                <CollapsibleTagGroup title="🔒 タグを見る">
                  <p className="mb-3 text-[11px] text-ink-faint">
                    タグにはシナリオの内容・構造・展開を推測できる情報が含まれる場合があります。
                  </p>
                  {normalTags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {normalTags.map((tag: string) => (
                        <span key={tag} className="rounded-full bg-tag-bg px-2.5 py-1 text-[11px] text-tag-ink">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {sensitiveTags.length > 0 && (
                    <div className="rounded-lg border border-[#D8B98E] bg-[#FBF3E7] p-4">
                      <div className="mb-2.5 text-xs font-medium text-[#8A5A1E]">
                        センシティブ要素（プレイ前に知っておきたい方向け）
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sensitiveTags.map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[#D8B98E] bg-white px-2.5 py-1 text-[11px] text-[#8A5A1E]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleTagGroup>
              </div>
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
                まだレビューがありません。
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
                {hasOwnReview ? "自分のレビューを編集する" : "レビューを投稿する"}
              </Link>
            </div>

            <ReviewList reviews={normalizeReviews(enrichedReviews)} scenarioId={scenario.id} isLoggedIn={!!user} />
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

function BasicInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-[12.5px]">
      <span className="w-[130px] flex-shrink-0 text-ink-faint">{label}</span>
      <span className="text-ink">{value}</span>
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
