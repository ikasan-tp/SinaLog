import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

type ScenarioCardData = {
  id: string;
  title: string;
  description: string | null;
  system_version: string | null;
  recommended_players: string | null;
  play_time: string | null;
  price_text: string;
  author_name: string | null;
};

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: scenarios }, { count: scenarioCount }, { count: reviewCount }] = await Promise.all([
    supabase
      .from("scenarios")
      .select(
        "id, title, description, system_version, recommended_players, play_time, price_text, author_name"
      )
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("scenarios").select("id", { count: "exact", head: true }).eq("is_hidden", false),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_hidden", false),
  ]);

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {/* ブランディング・用途説明。SNSでの引用やスクリーンショットにもここが写る想定。 */}
        <section className="mb-10 rounded-xl border border-line bg-panel px-7 py-9 text-center">
          <p className="mb-2 text-[11.5px] font-medium tracking-wide text-ink-faint">
            クトゥルフ神話TRPGシナリオ専門のレビューサイト
          </p>
          <h1 className="mb-3 text-2xl font-bold">
            Sina<span className="text-accent">Log</span>
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-pretty text-[13px] leading-relaxed text-ink-sub">
            実際に遊んだ探索者たちの声で、次に遊ぶ一本を選べる場所。
            <br />
            シナリオへの評価だけでなく、良いレビューを書いてくれた人にもきちんと光が当たる場所を目指しています。
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

        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-base font-bold">新着シナリオ</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(scenarios ?? []).map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}

          {/* シナリオ登録への呼びかけ */}
          <Link
            href="/scenarios/new"
            className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-bg p-5 text-center text-ink-faint hover:border-accent hover:bg-panel"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-[13px] font-bold text-ink-sub">シナリオを登録する</span>
            <span className="text-pretty text-[11.5px] leading-relaxed">
              {(scenarios?.length ?? 0) === 0
                ? "まだ登録されているシナリオは多くありません。あなたの一本を追加してみませんか？"
                : "あなたの一本を追加してみませんか？"}
            </span>
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

function ScenarioCard({ scenario }: { scenario: ScenarioCardData }) {
  return (
    <Link
      href={`/scenarios/${scenario.id}`}
      className="rounded-xl border border-line bg-panel transition-shadow hover:shadow-md"
    >
      <div className="relative h-[120px] rounded-t-xl bg-gradient-to-br from-[#3A2E33] to-[#241C22]">
        {scenario.system_version && (
          <span className="absolute left-2.5 top-2.5 rounded bg-white/90 px-2 py-0.5 text-[10px] text-tag-ink">
            {scenario.system_version}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="mb-1.5 text-sm font-bold">{scenario.title}</div>
        {scenario.description && (
          <p className="mb-2.5 line-clamp-2 text-xs text-ink-sub">{scenario.description}</p>
        )}
        <div className="flex gap-2.5 text-[11px] text-ink-faint">
          {scenario.recommended_players && <span>PL {scenario.recommended_players}</span>}
          {scenario.play_time && <span>{scenario.play_time}</span>}
          <span>{scenario.price_text}</span>
        </div>
      </div>
    </Link>
  );
}
