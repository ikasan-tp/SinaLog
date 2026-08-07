"use client";

import { useState, useTransition } from "react";
import { updateTasteTags } from "./actions";
import { TagSelect } from "@/components/form-fields";

export function TasteTagsEditor({
  initialTags,
  options,
}: {
  initialTags: string[];
  options: string[];
}) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(new Set(initialTags));
  const [isPending, startTransition] = useTransition();

  function startEdit() {
    setDraft(new Set(tags));
    setEditing(true);
  }

  function save() {
    const next = Array.from(draft);
    startTransition(async () => {
      await updateTasteTags(next);
      setTags(next);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-ink-sub">好きな傾向</span>
          <button
            type="button"
            onClick={startEdit}
            className="text-[11.5px] text-link underline hover:text-accent"
          >
            編集する
          </button>
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-tag-bg px-2.5 py-1 text-[11px] text-tag-ink">
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-faint">
            まだ設定されていません。好きなシナリオの傾向を選ぶと、レビュー欄などで参考にされやすくなります。
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 text-xs font-bold text-ink-sub">好きな傾向を選ぶ（複数選択可）</div>
      <TagSelect options={options} selected={draft} onToggle={(v) => toggle(draft, setDraft, v)} name="tasteTags" />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-1.5 text-[12px] text-white disabled:opacity-60"
        >
          {isPending ? "保存中…" : "保存する"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-line-strong px-4 py-1.5 text-[12px] text-ink-sub hover:bg-bg"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

function toggle(set: Set<string>, setSet: (s: Set<string>) => void, value: string) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  setSet(next);
}
