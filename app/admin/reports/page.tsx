import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { ReportActions } from "./report-actions-buttons";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/reports");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const { data: pending } = await supabase
    .from("reports")
    .select(
      "id, reason, comment, created_at, review_id, reviews(good_point, scenario_id, users(display_name), scenarios(title))"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { count: resolvedCount } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .neq("status", "pending");

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-5 flex items-center gap-4 text-[13px]">
          <Link href="/admin/reports" className="font-bold text-accent">
            通報
          </Link>
          <Link href="/admin/contacts" className="text-ink-sub hover:text-accent">
            お問い合わせ
          </Link>
        </div>

        <h1 className="mb-1.5 text-xl font-bold">通報の確認</h1>
        <p className="mb-6 text-[13px] text-ink-sub">
          レビューへの通報をここで確認します。判断が済むまで、公開画面には何も表示されません。
        </p>

        <div className="mb-6 flex gap-4 text-xs text-ink-faint">
          <span>
            未対応 <span className="font-bold text-ink">{pending?.length ?? 0}</span>
          </span>
          <span>
            対応済み <span className="font-bold text-ink">{resolvedCount ?? 0}</span>
          </span>
        </div>

        {!pending || pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong bg-bg p-8 text-center text-[13px] text-ink-faint">
            未対応の通報はありません。
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(pending as any[]).map((report) => {
              const review = Array.isArray(report.reviews) ? report.reviews[0] : report.reviews;
              const reviewer = Array.isArray(review?.users) ? review.users[0] : review?.users;
              const scenario = Array.isArray(review?.scenarios) ? review.scenarios[0] : review?.scenarios;

              return (
                <div key={report.id} className="rounded-xl border border-line bg-panel p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded bg-[#F6E7E5] px-2.5 py-1 text-[11px] font-medium text-[#8A2E2E]">
                      レビューへの通報
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      {new Date(report.created_at).toLocaleString("ja-JP")}
                    </span>
                  </div>

                  <div className="mb-3 rounded-md bg-bg p-3.5">
                    <div className="mb-1 text-[10px] text-ink-faint">
                      対象レビュー（{reviewer?.display_name ?? "不明なユーザー"} / {scenario?.title ?? "不明なシナリオ"}）
                    </div>
                    <div className="text-[13px]">{review?.good_point}</div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-tag-bg px-2.5 py-0.5 text-[11px] text-tag-ink">
                      {report.reason}
                    </span>
                  </div>

                  {report.comment && (
                    <p className="mb-3 border-l-2 border-line-strong pl-2.5 text-xs text-ink-sub">
                      {report.comment}
                    </p>
                  )}

                  <ReportActions reportId={report.id} reviewId={report.review_id} />
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
