import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

const SORT_OPTIONS = [
  { key: "new", label: "新着順" },
  { key: "helpful", label: "参考になった順" },
] as const;

export default async function PublicUserReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { id } = await params;
  const { sort: sortParam } = await searchParams;
  const sort = sortParam === "helpful" ? "helpful" : "new";

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, recommend, good_point, helpful_count, created_at, scenarios(id, title, system_version)"
    )
    .eq("user_id", id)
    .eq("is_hidden", false)
    .order(sort === "helpful" ? "helpful_count" : "created_at", { ascending: false });

  const rows = (reviews ?? []).map((r) => ({
    ...r,
    scenario: Array.isArray(r.scenarios) ? r.scenarios[0] : r.scenarios,
  }));

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <p className="mb-3 text-xs text-ink-faint">
          <Link href={`/u/${id}`} className="hover:text-accent">
            {profile.display_name}のプロフィール
          </Link>{" "}
          ＞ レビュー一覧
        </p>
        <h1 className="mb-5 text-xl font-bold">{profile.display_name}さんのレビュー（{rows.length}件）</h1>

        <div className="mb-5 flex gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.key}
              href={`/u/${id}/reviews${opt.key === "new" ? "" : `?sort=${opt.key}`}`}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                sort === opt.key
                  ? "border-accent bg-accent-bg text-accent"
                  : "border-line-strong text-ink-sub hover:bg-bg"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong bg-bg p-8 text-center text-[13px] text-ink-faint">
            まだレビューが投稿されていません。
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((review) => (
              <Link
                key={review.id}
                href={review.scenario ? `/scenarios/${review.scenario.id}` : "#"}
                className="block rounded-lg border border-line bg-panel p-4 hover:border-line-strong"
              >
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold">
                      {review.scenario?.title ?? "（削除されたシナリオ）"}
                    </span>
                    {review.scenario?.system_version && (
                      <span className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-tag-ink">
                        {review.scenario.system_version}
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      review.recommend ? "bg-ok-bg text-ok" : "bg-accent-bg text-accent"
                    }`}
                  >
                    {review.recommend ? "おすすめ" : "おすすめしない"}
                  </span>
                </div>
                <p className="mb-2 line-clamp-2 text-[12.5px] text-ink-sub">{review.good_point}</p>
                <div className="flex items-center justify-between text-[11px] text-ink-faint">
                  <span>参考になった {review.helpful_count}</span>
                  <span>{new Date(review.created_at).toLocaleDateString("ja-JP")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
