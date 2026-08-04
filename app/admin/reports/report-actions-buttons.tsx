"use client";

import { useTransition } from "react";
import { dismissReport, hideReviewFromReport } from "@/app/scenarios/[id]/report-actions";

export function ReportActions({ reportId, reviewId }: { reportId: string; reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => hideReviewFromReport(reportId, reviewId))}
        className="rounded-md border border-[#D9A8A0] bg-[#F6E7E5] px-4 py-1.5 text-xs text-[#8A2E2E] disabled:opacity-50"
      >
        レビューを非表示にする
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => dismissReport(reportId))}
        className="rounded-md border border-[#A9C4B2] bg-[#E9EFEA] px-4 py-1.5 text-xs text-ok disabled:opacity-50"
      >
        問題なし・却下する
      </button>
      <span className="text-[11px] text-ink-faint">非表示にすると投稿者にサイト内でお知らせが届きます</span>
    </div>
  );
}
