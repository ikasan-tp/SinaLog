"use client";

import { useRef } from "react";

type TagGroup = { title: string; tags: string[] };

export function SearchFiltersForm({
  q,
  systemOptions,
  selectedSystems,
  supplementOptions,
  selectedSupplements,
  playerOptions,
  selectedPlayers,
  playtimeOptions,
  selectedPlaytimes,
  priceOptions,
  selectedPrices,
  tagGroups,
  selectedTags,
  sort,
}: {
  q: string;
  systemOptions: string[];
  selectedSystems: string[];
  supplementOptions: string[];
  selectedSupplements: string[];
  playerOptions: string[];
  selectedPlayers: string[];
  playtimeOptions: string[];
  selectedPlaytimes: string[];
  priceOptions: { key: string; label: string }[];
  selectedPrices: string[];
  tagGroups: TagGroup[];
  selectedTags: string[];
  sort: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function submit() {
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      method="get"
      action="/search"
      className="rounded-xl border border-line bg-panel p-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto"
    >
      {q && <input type="hidden" name="q" value={q} />}
      {sort && sort !== "recommend" && <input type="hidden" name="sort" value={sort} />}

      <FilterGroup title="対応版">
        {systemOptions.map((opt) => (
          <CheckboxOption
            key={opt}
            name="system"
            value={opt}
            checked={selectedSystems.includes(opt)}
            onChange={submit}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="必要サプリメント">
        {supplementOptions.map((opt) => (
          <CheckboxOption
            key={opt}
            name="supplement"
            value={opt}
            checked={selectedSupplements.includes(opt)}
            onChange={submit}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="プレイ人数">
        {playerOptions.map((opt) => (
          <CheckboxOption
            key={opt}
            name="players"
            value={opt}
            checked={selectedPlayers.includes(opt)}
            onChange={submit}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="プレイ時間">
        {playtimeOptions.map((opt) => (
          <CheckboxOption
            key={opt}
            name="playtime"
            value={opt}
            checked={selectedPlaytimes.includes(opt)}
            onChange={submit}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="価格">
        {priceOptions.map((opt) => (
          <CheckboxOption
            key={opt.key}
            name="price"
            value={opt.key}
            label={opt.label}
            checked={selectedPrices.includes(opt.key)}
            onChange={submit}
          />
        ))}
      </FilterGroup>

      {tagGroups.map((group) => (
        <FilterGroup key={group.title} title={group.title}>
          {group.tags.map((tag) => (
            <CheckboxOption
              key={tag}
              name="tag"
              value={tag}
              checked={selectedTags.includes(tag)}
              onChange={submit}
            />
          ))}
        </FilterGroup>
      ))}

      <noscript>
        <button
          type="submit"
          className="mt-2 w-full rounded-md bg-accent px-4 py-2 text-[12.5px] text-white"
        >
          絞り込む
        </button>
      </noscript>
    </form>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2.5 text-xs font-bold">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckboxOption({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 text-[12.5px] ${
        checked ? "font-medium text-ink" : "text-ink-sub"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-accent"
      />
      {label ?? value}
    </label>
  );
}
