"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "./actions";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(() => {
      deleteAccount();
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-accent px-4 py-2 text-[12.5px] text-accent hover:bg-white"
      >
        アカウントを削除する
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-accent bg-white p-4">
      <p className="mb-3 text-pretty text-[12.5px] font-medium text-accent">
        本当に削除しますか？この操作は取り消せません。
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-2 text-[12.5px] text-white disabled:opacity-60"
        >
          {isPending ? "削除中…" : "削除する"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-md border border-line-strong px-4 py-2 text-[12.5px] text-ink-sub hover:bg-bg"
        >
          やめる
        </button>
      </div>
    </div>
  );
}
