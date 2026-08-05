import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

type ScenarioCard = {
  id: string;
  title: string;
  author_name: string | null;
  circle_name: string | null;
  price_text: string;
  system_version: string | null;
  recommended_players: string | null;
  play_time: string | null;
  description: string | null;
  thumbnail_url: string | null;
};

type ScenarioStats = {
  scenario_id: string;
  review_count: number | null;
  recommend_pct: number | null;
};

export default async function HomePage() {
  const scenarios = await getLatestScenarios();

  return (
    <>
      <Header />

      <div className="border-b border-line bg-panel">
        <nav className="mx-auto flex h-11 max-w-6xl items-center gap-6 overflow-x-auto px-6 text-[13px] text-ink-sub">
          <Link href="/" className="font-medium text-accent">シナリオを探す</Link>
          <Link href="/scenarios/new" className="whitespace-nowrap hover:text-accent">シナリオを登録する</Link>
          <Link href="/search" className="whitespace-nowrap hover:text-accent">人気ランキング</Link>
          <Link href="/search" className="whitespace-nowrap hover:text-accent">新着レビュー</Link>
          <Link href="/help" className="whitespace-nowrap hover:text-accent">ヘルプ</Link>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pt-5">
        <form action="/search" className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-panel p-4">
          <label className="flex min-w-60 flex-[2] flex-col gap-1.5 text-[11px] text-ink-faint">
            キーワード
            <input
              name="q"
              type="text"
              placeholder="タイトル・タグ・キーワード"
              className="rounded-md border border-line-strong bg-panel px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
            />
          </label>
          <FilterSelect name="system" label="版" options={["指定なし", "クトゥルフ神話TRPG", "新クトゥルフ神話TRPG"]} />
          <FilterSelect name="players" label="プレイ人数" options={["指定なし", "1人", "2〜3人", "4〜5人", "6人以上"]} />
          <FilterSelect name="time" label="プレイ時間" options={["指定なし", "〜2時間", "2〜4時間", "4〜8時間", "8時間以上"]} />
          <FilterSelect name="price" label="価格" options={["指定なし", "無料", "有料"]} />
          <button className="h-[38px] rounded-md bg-accent px-6 text-[13px] text-white hover:bg-accent-hover">
            検索する
          </button>
        </form>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-9">
        <h1 className="mb-4 text-base font-bold">新着シナリオ</h1>

        {scenarios.length > 0 ? (
          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {scenarios.map(({ scenario, stats }) => (
              <ScenarioCard key={scenario.id} scenario={scenario} stats={stats} />
            ))}
          </div>
        ) : (
          <Link
            href="/scenarios/new"
            className="flex min-h-[220px] max-w-sm flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-bg p-5 text-center text-ink-faint hover:border-accent hover:bg-panel"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="text-[13px] font-bold text-ink-sub">シナリオを登録する</span>
            <span className="text-[11.5px] leading-relaxed">
              まだ登録されているシナリオはありません。あなたの一本を追加してみませんか？
            </span>
          </Link>
        )}
      </main>

      <Footer />
    </>
  );
}

function FilterSelect({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="flex min-w-36 flex-col gap-1.5 text-[11px] text-ink-faint">
      {label}
      <select name={name} className="rounded-md border border-line-strong bg-panel px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ScenarioCard({ scenario, stats }: { scenario: ScenarioCard; stats?: ScenarioStats }) {
  const author = scenario.circle_name ?? scenario.author_name ?? "作者未設定";
  const avatar = author.slice(0, 1);
  const reviewCount = stats?.review_count ?? 0;
  const recommendPct = stats?.recommend_pct ?? null;

  return (
    <Link href={`/scenarios/${scenario.id}`} className="overflow-hidden rounded-lg border border-line bg-panel transition hover:border-line-strong hover:shadow-sm">
      <div className="relative flex h-[120px] items-start justify-start bg-gradient-to-br from-[#3A2E33] to-[#241C22]">
        {scenario.thumbnail_url && (
          <img src={scenario.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {scenario.system_version && (
          <span className="relative m-2.5 rounded bg-white/90 px-2 py-0.5 text-[10px] text-tag-ink">
            {scenario.system_version}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="mb-1.5 line-clamp-1 text-sm font-medium">{scenario.title}</div>
        <p className="mb-2.5 line-clamp-2 min-h-9 text-xs text-ink-sub">
          {scenario.description ?? "説明文はまだ登録されていません。"}
        </p>
        <div className="mb-2.5 flex flex-wrap gap-2 text-[11px] text-tag-ink">
          {scenario.recommended_players && <span className="rounded bg-tag-bg px-2 py-0.5">PL {scenario.recommended_players}</span>}
          {scenario.play_time && <span className="rounded bg-tag-bg px-2 py-0.5">{scenario.play_time}</span>}
          <span className="rounded bg-tag-bg px-2 py-0.5">{scenario.price_text}</span>
        </div>
        <div className="mb-2.5 flex items-center gap-1.5 text-xs">
          <span className="text-ok">♡</span>
          {recommendPct === null ? (
            <span className="text-ink-faint">レビュー待ち</span>
          ) : (
            <>
              <span className="font-bold text-ok">{recommendPct}%</span>
              <span className="text-[11px] text-ink-faint">おすすめ ({reviewCount}件)</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-line pt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-bg text-[9px] font-bold text-accent">
              {avatar}
            </span>
            <span className="text-[11px] text-ink-sub">{author}</span>
          </div>
          <span className="text-[11px] text-ink-faint">💬 {reviewCount}</span>
        </div>
      </div>
    </Link>
  );
}

async function getLatestScenarios() {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return [];

  const supabase = await createClient();
  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("id,title,author_name,circle_name,price_text,system_version,recommended_players,play_time,description,thumbnail_url")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(12);

  if (!scenarios?.length) return [];

  const ids = scenarios.map((scenario) => scenario.id);
  const { data: statsRows } = await supabase
    .from("scenario_stats")
    .select("scenario_id,review_count,recommend_pct")
    .in("scenario_id", ids);

  const statsByScenario = new Map((statsRows ?? []).map((stats) => [stats.scenario_id, stats]));
  return (scenarios as ScenarioCard[]).map((scenario) => ({
    scenario,
    stats: statsByScenario.get(scenario.id) as ScenarioStats | undefined,
  }));
}

