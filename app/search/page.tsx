import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { TAG_GROUPS, SENSITIVE_TAGS, SUPPLEMENTS, PLAYER_OPTIONS, SESSION_FORMAT_OPTIONS } from "@/lib/content-taxonomy";
import { SearchFiltersForm } from "./search-filters-form";
import { SortSelect as SortSelectClient, SORT_OPTIONS } from "./sort-select";

const PAGE_SIZE = 20;

const SYSTEM_OPTIONS = ["クトゥルフ神話TRPG", "新クトゥルフ神話TRPG"];
const PLAYTIME_OPTIONS = ["〜2時間", "2〜3時間", "4〜6時間", "8時間以上"];
const PRICE_OPTIONS = [
  { key: "free", label: "無料" },
  { key: "paid", label: "有料" },
];
const PLAYTIME_ORDER = ["〜2時間", "2〜3時間", "4〜6時間", "8時間以上"];

type SearchParams = {
  q?: string;
  system?: string | string[];
  supplement?: string | string[];
  players?: string | string[];
  playtime?: string | string[];
  format?: string | string[];
  price?: string | string[];
  tag?: string | string[];
  sensitive?: string | string[];
  sort?: string;
  page?: string;
};

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const systems = toArray(sp.system);
  const supplements = toArray(sp.supplement);
  const players = toArray(sp.players);
  const playtimes = toArray(sp.playtime);
  const formats = toArray(sp.format);
  const prices = toArray(sp.price);
  const tags = toArray(sp.tag);
  const sensitive = toArray(sp.sensitive);
  const sort = sp.sort && SORT_OPTIONS.some((o) => o.key === sp.sort) ? sp.sort : "recommend";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("scenarios")
    .select(
      "id, title, author_name, circle_name, system_version, recommended_players, play_time, session_formats, price_text, description, required_supplements, tags, created_at"
    )
    .eq("is_hidden", false);

  if (q) {
    const escaped = q.replace(/[%,]/g, "");
    query = query.or(
      `title.ilike.%${escaped}%,author_name.ilike.%${escaped}%,circle_name.ilike.%${escaped}%`
    );
  }
  if (systems.length > 0) query = query.in("system_version", systems);
  if (players.length > 0) query = query.in("recommended_players", players);
  if (playtimes.length > 0) query = query.in("play_time", playtimes);
  if (formats.length > 0) query = query.overlaps("session_formats", formats);
  if (supplements.length > 0) query = query.overlaps("required_supplements", supplements);
  if (tags.length > 0) query = query.overlaps("tags", tags);
  if (sensitive.length > 0) query = query.overlaps("tags", sensitive);
  if (prices.includes("free") && !prices.includes("paid")) {
    query = query.eq("price_text", "無料");
  } else if (prices.includes("paid") && !prices.includes("free")) {
    query = query.neq("price_text", "無料");
  }

  const { data: scenarios, error } = await query.limit(300);

  const ids = (scenarios ?? []).map((s) => s.id);
  const { data: statsRows } =
    ids.length > 0
      ? await supabase.from("scenario_stats").select("scenario_id, review_count, recommend_pct").in("scenario_id", ids)
      : { data: [] as { scenario_id: string; review_count: number; recommend_pct: number | null }[] };

  const statsMap = new Map((statsRows ?? []).map((s) => [s.scenario_id, s]));

  const merged = (scenarios ?? []).map((s) => ({
    ...s,
    reviewCount: statsMap.get(s.id)?.review_count ?? 0,
    recommendPct: statsMap.get(s.id)?.recommend_pct ?? null,
  }));

  merged.sort((a, b) => {
    switch (sort) {
      case "new":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "reviews":
        return b.reviewCount - a.reviewCount;
      case "short":
        return playtimeRank(a.play_time) - playtimeRank(b.play_time);
      case "recommend":
      default:
        // レビューが無いものは評価順の末尾に。件数が少なすぎる推薦率のブレは許容する簡易実装。
        if (a.recommendPct === null && b.recommendPct === null) return b.reviewCount - a.reviewCount;
        if (a.recommendPct === null) return 1;
        if (b.recommendPct === null) return -1;
        return b.recommendPct - a.recommendPct;
    }
  });

  const totalCount = merged.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = merged.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterChips = buildActiveFilterChips({
    q,
    systems,
    supplements,
    players,
    playtimes,
    formats,
    prices,
    tags,
    sensitive,
  });

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">{q ? `「${q}」の検索結果` : "シナリオ一覧"}</h1>
            <p className="mt-1 text-xs text-ink-sub">
              {error ? "検索中にエラーが発生しました。" : `${totalCount}件見つかりました`}
            </p>
          </div>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeFilterChips.map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className="flex items-center gap-1.5 rounded-full bg-accent-bg px-2.5 py-1 text-[12px] text-accent"
              >
                {chip.label}
                <span aria-hidden>×</span>
              </Link>
            ))}
            <Link href="/search" className="text-[12px] text-ink-faint underline hover:text-ink-sub">
              すべて解除
            </Link>
          </div>
        )}

        <div className="grid items-start gap-7 lg:grid-cols-[220px_1fr]">
          <SearchFiltersForm
            q={q}
            systemOptions={SYSTEM_OPTIONS}
            selectedSystems={systems}
            supplementOptions={SUPPLEMENTS}
            selectedSupplements={supplements}
            playerOptions={PLAYER_OPTIONS}
            selectedPlayers={players}
            playtimeOptions={PLAYTIME_OPTIONS}
            selectedPlaytimes={playtimes}
            formatOptions={SESSION_FORMAT_OPTIONS}
            selectedFormats={formats}
            priceOptions={PRICE_OPTIONS}
            selectedPrices={prices}
            tagGroups={TAG_GROUPS}
            selectedTags={tags}
            sensitiveOptions={SENSITIVE_TAGS}
            selectedSensitive={sensitive}
            sort={sort}
          />

          <div>
            <div className="mb-4 flex items-center justify-end">
              <SortSelect sort={sort} baseParams={sp} />
            </div>

            {pageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line-strong bg-bg p-8 text-center text-pretty text-[13px] text-ink-faint">
                条件に合うシナリオはまだ見つかりませんでした。
                <br />
                絞り込みを減らすか、
                <Link href="/scenarios/new" className="text-accent underline">
                  シナリオを登録する
                </Link>
                と、ここに表示されます。
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pageItems.map((scenario) => (
                  <ResultCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} baseParams={sp} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function playtimeRank(playTime: string | null) {
  if (!playTime) return PLAYTIME_ORDER.length;
  const idx = PLAYTIME_ORDER.indexOf(playTime);
  return idx === -1 ? PLAYTIME_ORDER.length : idx;
}

type ResultScenario = {
  id: string;
  title: string;
  author_name: string | null;
  circle_name: string | null;
  system_version: string | null;
  recommended_players: string | null;
  play_time: string | null;
  price_text: string;
  description: string | null;
  reviewCount: number;
  recommendPct: number | null;
};

function ResultCard({ scenario }: { scenario: ResultScenario }) {
  return (
    <Link
      href={`/scenarios/${scenario.id}`}
      className="flex gap-4 rounded-xl border border-line bg-panel p-4 transition-colors hover:border-line-strong"
    >
      <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#3A2E33] to-[#241C22]" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold">{scenario.title}</span>
            {scenario.system_version && (
              <span className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-tag-ink">
                {scenario.system_version}
              </span>
            )}
          </div>
          {scenario.recommendPct !== null && (
            <span className="flex-shrink-0 text-[13px] font-bold text-ok">{scenario.recommendPct}%</span>
          )}
        </div>
        {scenario.description && (
          <p className="mb-2.5 line-clamp-2 text-[12.5px] text-ink-sub">{scenario.description}</p>
        )}
        <div className="mb-2.5 flex flex-wrap gap-1.5 text-[11px]">
          {scenario.recommended_players && (
            <span className="rounded bg-tag-bg px-2 py-0.5 text-tag-ink">PL {scenario.recommended_players}</span>
          )}
          {scenario.play_time && (
            <span className="rounded bg-tag-bg px-2 py-0.5 text-tag-ink">{scenario.play_time}</span>
          )}
          <span className="rounded bg-tag-bg px-2 py-0.5 text-tag-ink">{scenario.price_text}</span>
        </div>
        <div className="flex justify-between text-[11px] text-ink-faint">
          <span>{scenario.circle_name || scenario.author_name || "作者不明"}</span>
          <span>レビュー{scenario.reviewCount}件</span>
        </div>
      </div>
    </Link>
  );
}

function SortSelect({ sort, baseParams }: { sort: string; baseParams: SearchParams }) {
  return <SortSelectClient sort={sort} hiddenFields={hiddenFieldEntries(baseParams, ["sort", "page"])} />;
}

function hiddenFieldEntries(params: SearchParams, exclude: string[]) {
  const entries: { name: string; value: string }[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (exclude.includes(key) || value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => entries.push({ name: key, value: v }));
    } else {
      entries.push({ name: key, value });
    }
  }
  return entries;
}

function Pagination({
  currentPage,
  totalPages,
  baseParams,
}: {
  currentPage: number;
  totalPages: number;
  baseParams: SearchParams;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="mt-9 flex items-center justify-center gap-1.5">
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(baseParams, { page: String(p) })}
          className={`flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[12.5px] ${
            p === currentPage
              ? "border-accent bg-accent text-white"
              : "border-line-strong text-ink-sub hover:bg-bg"
          }`}
        >
          {p}
        </Link>
      ))}
    </div>
  );
}

function buildHref(base: SearchParams, overrides: Record<string, string>) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(base)) {
    if (value === undefined || key === "page") continue;
    if (Array.isArray(value)) value.forEach((v) => usp.append(key, v));
    else usp.append(key, value);
  }
  for (const [key, value] of Object.entries(overrides)) {
    usp.set(key, value);
  }
  return `/search?${usp.toString()}`;
}

function buildActiveFilterChips({
  q,
  systems,
  supplements,
  players,
  playtimes,
  formats,
  prices,
  tags,
  sensitive,
}: {
  q: string;
  systems: string[];
  supplements: string[];
  players: string[];
  playtimes: string[];
  formats: string[];
  prices: string[];
  tags: string[];
  sensitive: string[];
}) {
  const chips: { label: string; href: string; group: keyof SearchParams; value: string }[] = [];

  const base: SearchParams = {
    q: q || undefined,
    system: systems,
    supplement: supplements,
    players,
    playtime: playtimes,
    format: formats,
    price: prices,
    tag: tags,
    sensitive,
  };

  const pushChips = (group: keyof SearchParams, values: string[], labelOf: (v: string) => string) => {
    for (const v of values) {
      chips.push({ label: labelOf(v), href: removeFromParams(base, group, v), group, value: v });
    }
  };

  pushChips("system", systems, (v) => v);
  pushChips("supplement", supplements, (v) => v);
  pushChips("players", players, (v) => v);
  pushChips("playtime", playtimes, (v) => v);
  pushChips("format", formats, (v) => v);
  pushChips("price", prices, (v) => (v === "free" ? "無料" : "有料"));
  pushChips("tag", tags, (v) => v);
  pushChips("sensitive", sensitive, (v) => v);

  return chips;
}

function removeFromParams(base: SearchParams, group: keyof SearchParams, value: string) {
  const usp = new URLSearchParams();
  for (const [key, v] of Object.entries(base)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      const next = key === group ? v.filter((x) => x !== value) : v;
      next.forEach((x) => usp.append(key, x));
    } else if (v) {
      usp.append(key, v);
    }
  }
  return `/search?${usp.toString()}`;
}
