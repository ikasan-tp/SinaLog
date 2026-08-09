"use client";

import { useState, useTransition } from "react";
import { updateBio } from "./actions";

export function BioEditor({ initialBio }: { initialBio: string }) {
  const [committedBio, setCommittedBio] = useState(initialBio);
  const [draftBio, setDraftBio] = useState(initialBio);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updateBio({}, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setCommittedBio(draftBio);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-0.5 text-xs font-bold text-ink-sub">自己紹介</div>
          {committedBio ? (
            <p className="text-pretty text-[13px] leading-relaxed">{committedBio}</p>
          ) : (
            <p className="text-[13px] text-ink-faint">
              まだ自己紹介が設定されていません。公開マイページに表示されます。
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setDraftBio(committedBio);
            setError("");
            setEditing(true);
          }}
          className="flex-shrink-0 text-[11.5px] text-link underline hover:text-accent"
        >
          {committedBio ? "変更する" : "書く"}
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit}>
      <div className="mb-0.5 text-xs font-bold text-ink-sub">自己紹介</div>
      <textarea
        name="bio"
        value={draftBio}
        onChange={(e) => setDraftBio(e.target.value)}
        maxLength={300}
        rows={3}
        placeholder="好きなシナリオの傾向や、TRPG歴などを自由に書いてください"
        className="w-full rounded-md border border-line-strong px-3 py-2 text-[13px] outline-none focus:border-accent"
      />
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[11px] text-ink-faint">{draftBio.length}/300文字</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-line-strong px-4 py-1.5 text-[12px] text-ink-sub hover:bg-bg"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-accent px-4 py-1.5 text-[12px] text-white disabled:opacity-60"
          >
            {isPending ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
      {error && <p className="mt-1.5 text-[11.5px] text-accent">{error}</p>}
    </form>
  );
}
