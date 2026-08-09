import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AvatarIcon } from "@/components/avatar-icon";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", id)
    .maybeSingle();

  if (!profile) return { title: "ユーザーが見つかりません" };

  const title = `${profile.display_name}さんのプロフィール`;
  const description = `${profile.display_name}さんのレビュー貢献度・おすすめシナリオをシナログで見る。`;
  return { title, description, openGraph: { title, description }, twitter: { title, description } };
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: reputation }, { data: favorites }] = await Promise.all([
    supabase
      .from("users")
      .select("id, display_name, avatar_icon, avatar_color, taste_tags, bio, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("user_review_reputation")
      .select("review_count, helpful_total")
      .eq("user_id", id)
      .maybeSingle(),
    supabase
      .from("favorites")
      .select("scenario_id, note, scenarios(id, title, system_version, price_text)")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (!profile) notFound();

  const reviewCount = reputation?.review_count ?? 0;
  const helpfulTotal = reputation?.helpful_total ?? 0;
  const joinedYear = new Date(profile.created_at).getFullYear();
  const joinedMonth = new Date(profile.created_at).getMonth() + 1;

  const favoriteScenarios = (favorites ?? [])
    .map((f) => ({
      note: f.note as string | null,
      scenario: Array.isArray(f.scenarios) ? f.scenarios[0] : f.scenarios,
    }))
    .filter((f): f is { note: string | null; scenario: NonNullable<typeof f.scenario> } => !!f.scenario);

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {/* プロフィールヘッダー */}
        <div className="mb-6 rounded-xl border border-line bg-panel p-7">
          <div className="flex items-center gap-4">
            <AvatarIcon
              icon={profile.avatar_icon}
              color={profile.avatar_color}
              displayName={profile.display_name}
              size={64}
            />
            <div>
              <div className="text-lg font-bold">{profile.display_name}</div>
              <div className="text-xs text-ink-faint">
                {joinedYear}年{joinedMonth}月から利用
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-5 text-pretty border-t border-line pt-5 text-[13px] leading-relaxed">
              {profile.bio}
            </p>
          )}

          {(profile.taste_tags ?? []).length > 0 && (
            <div className={`flex flex-wrap gap-1.5 ${profile.bio ? "mt-4" : "mt-5 border-t border-line pt-5"}`}>
              {(profile.taste_tags ?? []).map((tag: string) => (
                <span key={tag} className="rounded-full bg-tag-bg px-2.5 py-1 text-[11px] text-tag-ink">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* レビュー貢献度: 個別レビューの内訳ではなく、累計値を目立たせる */}
        <div className="mb-6 rounded-xl border border-line bg-panel p-7 text-center">
          <div className="mb-1 text-xs font-bold text-ink-sub">レビュー貢献度</div>
          <div className="mb-1 flex items-center justify-center gap-2">
            <HelpfulIcon />
            <span className="text-3xl font-bold text-accent">{helpfulTotal}</span>
            <span className="text-sm text-ink-sub">回参考になりました</span>
          </div>
          <p className="mb-5 text-[11.5px] text-ink-faint">
            {reviewCount}件のレビューが、他の利用者のシナリオ選びの参考になっています
          </p>
          <Link
            href={`/u/${id}/reviews`}
            className="inline-block rounded-md border border-line-strong px-5 py-2 text-[12.5px] text-ink-sub hover:bg-bg"
          >
            レビューを見る
          </Link>
        </div>

        {/* おすすめシナリオ(お気に入り) */}
        <div className="rounded-xl border border-line bg-panel p-7">
          <div className="mb-4 text-sm font-bold">おすすめシナリオ</div>
          {favoriteScenarios.length === 0 ? (
            <p className="text-[13px] text-ink-faint">まだ登録されていません。</p>
          ) : (
            <div className="space-y-3">
              {favoriteScenarios.map(({ note, scenario }) => (
                <Link
                  key={scenario.id}
                  href={`/scenarios/${scenario.id}`}
                  className="block rounded-lg border border-line p-4 hover:border-line-strong"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold">{scenario.title}</span>
                    {scenario.system_version && (
                      <span className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-tag-ink">
                        {scenario.system_version}
                      </span>
                    )}
                  </div>
                  {note && <p className="text-pretty text-[12px] text-ink-sub">{note}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function HelpfulIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <path d="M7 10v11" />
      <path d="M2 10h4v11H2V10Z" />
      <path d="M7 10l3-8a2 2 0 0 1 2 2v5h6.3a2 2 0 0 1 2 2.4l-1.5 7A2 2 0 0 1 17 21H7" />
    </svg>
  );
}
