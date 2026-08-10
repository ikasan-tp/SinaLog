import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AvatarIcon } from "@/components/avatar-icon";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import { TAG_GROUPS } from "@/lib/content-taxonomy";
import { MypageTabs } from "./mypage-tabs";
import { TasteTagsEditor } from "./taste-tags-editor";
import { DisplayNameEditor } from "./display-name-editor";
import { BioEditor } from "./bio-editor";
import { DeleteAccountButton } from "./delete-account-button";

export default async function MypagePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/mypage");

  const [{ data: profile }, { data: reviews }, { data: favorites }, { data: scenarios }, { data: reputation }] =
    await Promise.all([
      supabase
        .from("users")
        .select("display_name, avatar_icon, avatar_color, taste_tags, bio, created_at")
        .eq("id", user.id)
        .single(),
      supabase
        .from("reviews")
        .select(
          "id, good_point, recommend, helpful_count, created_at, is_hidden, scenarios(id, title, system_version)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("favorites")
        .select("scenario_id, note, created_at, scenarios(id, title, system_version, price_text)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("scenarios")
        .select("id, title, system_version, price_text, is_hidden, created_at")
        .eq("registered_by", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_review_reputation")
        .select("review_count, helpful_total")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (!profile) redirect("/login?next=/mypage");

  // 登録したシナリオそれぞれのレビュー件数(1件でもあれば本人は削除できない仕様のため、UIに反映する)
  const scenarioIds = (scenarios ?? []).map((s) => s.id);
  const { data: scenarioStatsRows } =
    scenarioIds.length > 0
      ? await supabase.from("scenario_stats").select("scenario_id, review_count").in("scenario_id", scenarioIds)
      : { data: [] as { scenario_id: string; review_count: number }[] };
  const scenarioReviewCounts = new Map((scenarioStatsRows ?? []).map((s) => [s.scenario_id, s.review_count]));
  const scenariosWithReviewCount = (scenarios ?? []).map((s) => ({
    ...s,
    reviewCount: scenarioReviewCounts.get(s.id) ?? 0,
  }));

  const reviewCount = reviews?.length ?? 0;
  const favoriteCount = favorites?.length ?? 0;
  // 非公開(通報等でis_hidden=trueになった)レビューの分は集計に含めない集計ビューを使う
  const helpfulReceived = reputation?.helpful_total ?? 0;
  const joinedYear = new Date(profile.created_at).getFullYear();
  const joinedMonth = new Date(profile.created_at).getMonth() + 1;

  // 認証プロバイダ(Google / メール)の表示用
  const provider = user.app_metadata?.provider === "google" ? "Googleアカウント" : "メールアドレス";
  const email = user.email ?? "";


  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {/* プロフィールヘッダー */}
        <div className="mb-6 rounded-xl border border-line bg-panel p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
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
            <div className="flex flex-shrink-0 gap-2">
              <Link
                href={`/u/${user.id}`}
                className="rounded-md border border-line-strong px-4 py-2 text-xs text-ink-sub hover:bg-bg"
              >
                公開プロフィールを見る
              </Link>
              <Link
                href="/mypage/avatar"
                className="rounded-md border border-line-strong px-4 py-2 text-xs text-ink-sub hover:bg-bg"
              >
                アイコンを変更
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center">
            <Stat label="投稿レビュー" value={reviewCount} />
            <Stat label="好きなシナリオ" value={favoriteCount} />
            <Stat label="参考になった" value={helpfulReceived} />
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <BioEditor initialBio={profile.bio ?? ""} />
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <TasteTagsEditor initialTags={profile.taste_tags ?? []} tagGroups={TAG_GROUPS} />
          </div>
        </div>

        <MypageTabs
          reviews={normalizeReviews(reviews)}
          favorites={normalizeFavorites(favorites)}
          scenarios={scenariosWithReviewCount}
          settingsContent={
            <div className="space-y-5">
              <div className="rounded-xl border border-line bg-panel p-6">
                <DisplayNameEditor initialName={profile.display_name} />

                <div className="mt-5 border-t border-line pt-5">
                  <div className="mb-1 text-xs font-bold text-ink-sub">ログイン方法</div>
                  <p className="text-[13px] text-ink-sub">
                    {provider}
                    {email && <span className="text-ink-faint">（{email}）</span>}
                    でログイン中
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-bold text-ink-sub">表示テーマ</div>
                <ThemeSwitcher />
              </div>

              <div className="rounded-xl border border-accent-bg bg-accent-bg p-6">
                <div className="mb-1 text-[13px] font-bold text-accent">アカウントを削除する</div>
                <p className="mb-4 text-pretty text-xs leading-relaxed text-ink-sub">
                  投稿したレビュー・登録したシナリオ・お気に入りは全て削除されます。この操作は取り消せません。
                </p>
                <DeleteAccountButton />
              </div>
            </div>
          }
        />
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xl font-bold text-accent">{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-faint">{label}</div>
    </div>
  );
}

// Supabaseの型推論では1:1のはずのリレーションも配列型になることがあるため、正規化しておく
function normalizeReviews(rows: Record<string, unknown>[] | null) {
  return (rows ?? []).map((row) => ({
    ...row,
    scenarios: Array.isArray(row.scenarios) ? (row.scenarios[0] ?? null) : row.scenarios,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any;
}

function normalizeFavorites(rows: Record<string, unknown>[] | null) {
  return (rows ?? []).map((row) => ({
    ...row,
    scenarios: Array.isArray(row.scenarios) ? (row.scenarios[0] ?? null) : row.scenarios,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any;
}
