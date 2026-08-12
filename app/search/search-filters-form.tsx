"use client";

import { useRef } from "react";
import { CollapsibleTagGroup } from "@/components/collapsible-tag-group";

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
  sensitiveOptions,
  selectedSensitive,
  sort,
}: {
  q: string;
  systemOptions: string[];
  selectedSystems: string[];
  supplementOptions: string[];
  selectedSupplements: string[];
  playerOptions: string[];
  selectedPlayers: string[];
  playtimeOptions: { key: string; label: string }[];
  selectedPlaytimes: string[];
  priceOptions: { key: string; label: string }[];
  selectedPrices: string[];
  tagGroups: TagGroup[];
  selectedTags: string[];
  sensitiveOptions: string[];
  selectedSensitive: string[];
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
      className="rounded-xl border border-line bg-panel p-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto"
    >
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-bold text-ink-sub">キーワード検索</label>
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="シナリオ名・作者名で検索"
            className="min-w-0 flex-1 rounded-md border border-line-strong px-3 py-2 text-[13px] outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="flex-shrink-0 rounded-md bg-accent px-3.5 text-[12.5px] text-white"
          >
            検索
          </button>
        </div>
      </div>

      {sort && sort !== "recommend" && <input type="hidden" name="sort" value={sort} />}

      <div className="space-y-4">
        <CollapsibleTagGroup title="対応版" selectedCount={selectedSystems.length} defaultOpen>
          <div className="space-y-2.5">
            {systemOptions.map((opt) => (
              <CheckboxOption
                key={opt}
                name="system"
                value={opt}
                checked={selectedSystems.includes(opt)}
                onChange={submit}
              />
            ))}
          </div>
        </CollapsibleTagGroup>

        <CollapsibleTagGroup title="必要サプリメント" selectedCount={selectedSupplements.length}>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-1">
            {supplementOptions.map((opt) => (
              <CheckboxOption
                key={opt}
                name="supplement"
                value={opt}
                checked={selectedSupplements.includes(opt)}
                onChange={submit}
              />
            ))}
          </div>
        </CollapsibleTagGroup>

        <CollapsibleTagGroup title="プレイ人数" selectedCount={selectedPlayers.length} defaultOpen>
          <div className="space-y-2.5">
            {playerOptions.map((opt) => (
              <CheckboxOption
                key={opt}
                name="players"
                value={opt}
                checked={selectedPlayers.includes(opt)}
                onChange={submit}
              />
            ))}
          </div>
        </CollapsibleTagGroup>

        <CollapsibleTagGroup title="プレイ時間" selectedCount={selectedPlaytimes.length}>
          <div className="space-y-2.5">
            {playtimeOptions.map((opt) => (
              <CheckboxOption
                key={opt.key}
                name="playtime"
                value={opt.key}
                label={opt.label}
                checked={selectedPlaytimes.includes(opt.key)}
                onChange={submit}
              />
            ))}
          </div>
        </CollapsibleTagGroup>

        <CollapsibleTagGroup title="価格" selectedCount={selectedPrices.length} defaultOpen>
          <div className="space-y-2.5">
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
          </div>
        </CollapsibleTagGroup>

        {tagGroups.map((group) => (
          <CollapsibleTagGroup
            key={group.title}
            title={group.title}
            selectedCount={group.tags.filter((t) => selectedTags.includes(t)).length}
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {group.tags.map((tag) => (
                <CheckboxOption
                  key={tag}
                  name="tag"
                  value={tag}
                  checked={selectedTags.includes(tag)}
                  onChange={submit}
                />
              ))}
            </div>
          </CollapsibleTagGroup>
        ))}

        <CollapsibleTagGroup
          title="センシティブ要素"
          selectedCount={selectedSensitive.length}
          tone="sensitive"
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-1">
            {sensitiveOptions.map((opt) => (
              <label
                key={opt}
                className={`flex cursor-pointer items-center gap-2 text-[12.5px] ${
                  selectedSensitive.includes(opt) ? "font-medium text-[#8A5A1E]" : "text-[#8A5A1E]/80"
                }`}
              >
                <input
                  type="checkbox"
                  name="sensitive"
                  value={opt}
                  defaultChecked={selectedSensitive.includes(opt)}
                  onChange={submit}
                  className="h-3.5 w-3.5 accent-[#8A5A1E]"
                />
                {opt}
              </label>
            ))}
          </div>
        </CollapsibleTagGroup>
      </div>

      <noscript>
        <button
          type="submit"
          className="mt-3 w-full rounded-md bg-accent px-4 py-2 text-[12.5px] text-white"
        >
          絞り込む
        </button>
      </noscript>
    </form>
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
