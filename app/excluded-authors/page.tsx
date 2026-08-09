import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

export default async function ExcludedAuthorsPage() {
  const supabase = await createClient();

  const { data: excludedAuthors } = await supabase
    .from("excluded_authors")
    .select("id, author_or_circle_name, requested_at")
    .order("requested_at", { ascending: false });

  const rows = excludedAuthors ?? [];

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 text-pretty px-6 py-9">
        <p className="mb-5 text-xs text-ink-faint">
          <Link href="/" className="hover:text-accent">
            トップ
          </Link>{" "}
          ＞ 掲載不可作者一覧
        </p>

        <h1 className="mb-2 text-2xl font-bold">掲載不可作者一覧</h1>
        <p className="mb-2 text-[13px] leading-relaxed text-ink-sub">
          以下に記載の作者・サークルの無料公開シナリオは、ご本人からの申し出により、SinaLogへの新規掲載およびレビュー投稿の受付を停止しています。既に投稿されているレビューがある場合も、申し出があり次第、該当ページごと非公開にします。
        </p>
        <p className="mb-7 text-[13px] leading-relaxed text-ink-sub">
          有償頒布シナリオについては、購入を検討する方にとってレビューが重要な判断材料となるため、原則として掲載停止の対象外としています。著作権侵害や法令違反など、運営が対応の必要があると判断した場合は個別に対応します。
        </p>

        <div className="mb-8 rounded-lg border border-line bg-panel p-6">
          <div className="mb-2 text-sm font-bold">作者・サークルの方へ</div>
          <p className="mb-4 text-[12.5px] leading-relaxed text-ink-sub">
            無料公開作品の掲載を希望されない場合は、こちらからご連絡ください。確認後、対象ページを非公開にし、この一覧に追加します（有償頒布作品については、上記のとおり対応可否が異なります）。
          </p>
          <a
            href="mailto:contact@sinalog.example"
            className="inline-block rounded-md bg-accent px-5 py-2.5 text-[13px] text-white hover:bg-accent-hover"
          >
            掲載停止を申請する
          </a>
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-panel">
          <div className="grid grid-cols-[1fr_140px] border-b border-line px-5 py-3 text-[11px] text-ink-faint">
            <span>作者名・サークル名</span>
            <span>登録日</span>
          </div>

          {rows.length === 0 ? (
            <div className="grid grid-cols-[1fr_140px] px-5 py-4 text-[13px]">
              <span className="text-ink-faint">（申し出は現在ありません）</span>
              <span className="text-xs text-ink-faint">—</span>
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_140px] border-b border-line px-5 py-4 text-[13px] last:border-b-0"
              >
                <span>{row.author_or_circle_name}</span>
                <span className="text-xs text-ink-faint">
                  {new Date(row.requested_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 rounded-lg border border-line bg-panel p-4 text-[11.5px] leading-relaxed text-ink-faint">
          掲載停止の申請は、作者・サークルご本人からのご連絡のみ受け付けています。第三者からの申し出には対応できませんので、あらかじめご了承ください。
        </div>
      </main>
      <Footer />
    </>
  );
}
