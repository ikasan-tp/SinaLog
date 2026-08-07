"use client";

export const SORT_OPTIONS = [
  { key: "recommend", label: "評価が高い順" },
  { key: "new", label: "新着順" },
  { key: "reviews", label: "レビューが多い順" },
  { key: "short", label: "プレイ時間が短い順" },
];

export function SortSelect({
  sort,
  hiddenFields,
}: {
  sort: string;
  hiddenFields: { name: string; value: string }[];
}) {
  return (
    <form method="get" action="/search">
      {hiddenFields.map((f, i) => (
        <input key={`${f.name}-${i}`} type="hidden" name={f.name} value={f.value} />
      ))}
      <select
        name="sort"
        defaultValue={sort}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-line-strong bg-panel px-3 py-1.5 text-[12.5px] text-ink-sub outline-none focus:border-accent"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="ml-2 rounded-md border border-line-strong px-3 py-1.5 text-[12px]">
          並び替え
        </button>
      </noscript>
    </form>
  );
}
