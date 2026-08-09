"use client";

import { useState } from "react";
import { ReviewCard } from "./review-card";

type ReviewRow = Parameters<typeof ReviewCard>[0]["review"];

export function ReviewList({
  reviews,
  scenarioId,
  isLoggedIn,
}: {
  reviews: ReviewRow[];
  scenarioId: string;
  isLoggedIn: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "low">("all");

  const recommendCount = reviews.filter((r) => r.recommend).length;
  const visible = filter === "all" ? reviews.filter((r) => r.recommend) : reviews;

  return (
    <div>
      <div className="mb-2.5 flex flex-wrap gap-2">
        <TabButton active={filter === "all"} onClick={() => setFilter("all")}>
          高評価のみ <span className="text-ink-faint">({recommendCount})</span>
        </TabButton>
        <TabButton active={filter === "low"} onClick={() => setFilter("low")} caution>
          <WarnIcon />
          気になる点も含む <span className="text-ink-faint">({reviews.length})</span>
        </TabButton>
      </div>
      <p className="mb-4 text-[11px] text-ink-faint">
        {filter === "all"
          ? "初期表示では、厳しめの評価を含めていません。すべて確認したい場合はタブを切り替えてください。"
          : "おすすめしないの評価も含めて表示しています。"}
      </p>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-ink-faint">まだレビューがありません。</p>
      ) : (
        visible.map((review) => (
          <ReviewCard key={review.id} review={review} scenarioId={scenarioId} isLoggedIn={isLoggedIn} />
        ))
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  caution,
  children,
}: {
  active: boolean;
  onClick: () => void;
  caution?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
        active
          ? caution
            ? "border-[#C9962F] bg-[#FBF3E7] text-[#8A5A1E]"
            : "border-accent bg-accent-bg text-accent"
          : "border-line-strong text-ink-sub"
      }`}
    >
      {children}
    </button>
  );
}

function WarnIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" strokeLinecap="butt" />
      <line x1="12" y1="8" x2="12" y2="12.5" />
      <line x1="12" y1="16" x2="12" y2="16.01" />
    </svg>
  );
}
