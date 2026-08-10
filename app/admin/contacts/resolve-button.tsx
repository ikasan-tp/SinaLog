"use client";

import { useTransition } from "react";
import { resolveContact } from "./actions";

export function ResolveContactButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => resolveContact(id))}
      disabled={isPending}
      className="rounded-md border border-line-strong px-3.5 py-1.5 text-[11.5px] text-ink-sub hover:bg-bg disabled:opacity-60"
    >
      {isPending ? "処理中…" : "対応済みにする"}
    </button>
  );
}
