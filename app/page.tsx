import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeSwitcher } from "@/components/theme-switcher";

// TODO: 実装が進んだら、Supabaseから新着シナリオ一覧を取得して表示する
// const supabase = await createClient();
// const { data: scenarios } = await supabase.from("scenarios").select("*").order("created_at", { ascending: false });

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-base font-bold">新着シナリオ</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 実データ接続後、この1件はSupabaseから取得したリストに置き換わる */}
          <Link
            href="/scenarios/sample"
            className="rounded-xl border border-line bg-panel transition-shadow hover:shadow-md"
          >
            <div className="relative h-[120px] rounded-t-xl bg-gradient-to-br from-[#3A2E33] to-[#241C22]">
              <span className="absolute left-2.5 top-2.5 rounded bg-white/90 px-2 py-0.5 text-[10px] text-tag-ink">
                新クトゥルフ神話TRPG
              </span>
            </div>
            <div className="p-3.5">
              <div className="mb-1.5 text-sm font-bold">深夜のコールセンター</div>
              <p className="mb-2.5 line-clamp-2 text-xs text-ink-sub">
                深夜のコールセンターに配属された探索者たちが、繰り返される奇妙なクレーム電話を調査する。
              </p>
              <div className="mb-2.5 flex gap-2.5 text-[11px] text-ink-faint">
                <span>PL 1〜3人</span>
                <span>2〜3時間</span>
                <span>無料</span>
              </div>
            </div>
          </Link>

          {/* シナリオ登録への呼びかけ(データがまだ少ない状態の空きスロット) */}
          <Link
            href="/scenarios/new"
            className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-bg p-5 text-center text-ink-faint hover:border-accent hover:bg-panel"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-[13px] font-bold text-ink-sub">シナリオを登録する</span>
            <span className="text-[11.5px] leading-relaxed">
              まだ登録されているシナリオは多くありません。
              <br />
              あなたの一本を追加してみませんか？
            </span>
          </Link>
        </div>

        {/* --- ここから下は雛形の動作確認用セクション。実装が進んだら削除してよい --- */}
        <div className="mt-16 border-t border-line pt-10">
          <h2 className="mb-1 text-sm font-bold">開発用: テーマ切替の動作確認</h2>
          <p className="mb-4 text-xs text-ink-faint">
            ライト/ダークとアクセントカラーがCSS変数経由で全体に反映されることを確認するための一時セクション。
          </p>
          <ThemeSwitcher />
        </div>
      </main>

      <Footer />
    </>
  );
}
