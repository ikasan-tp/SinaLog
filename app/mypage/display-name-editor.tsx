"use client";

import { useState, useTransition } from "react";
import { updateDisplayName } from "./actions";

export function DisplayNameEditor({ initialName }: { initialName: string }) {
  const [committedName, setCommittedName] = useState(initialName);
  const [draftName, setDraftName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updateDisplayName({}, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setCommittedName(draftName);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-0.5 text-xs font-bold text-ink-sub">表示名</div>
          <div className="text-[13px]">{committedName}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            setDraftName(committedName);
            setError("");
            setEditing(true);
          }}
          className="text-[11.5px] text-link underline hover:text-accent"
        >
          変更する
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit}>
      <div className="mb-0.5 text-xs font-bold text-ink-sub">表示名</div>
      <div className="flex gap-2">
        <input
          name="displayName"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          maxLength={30}
          className="flex-1 rounded-md border border-line-strong px-3 py-2 text-[13px] outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex-shrink-0 rounded-md bg-accent px-4 py-2 text-[12px] text-white disabled:opacity-60"
        >
          {isPending ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex-shrink-0 rounded-md border border-line-strong px-4 py-2 text-[12px] text-ink-sub hover:bg-bg"
        >
          キャンセル
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11.5px] text-accent">{error}</p>}
    </form>
  );
}
