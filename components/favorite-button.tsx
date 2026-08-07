"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/mypage/actions";

export function FavoriteButton({
  scenarioId,
  isLoggedIn,
  initialFavorited,
}: {
  scenarioId: string;
  isLoggedIn: boolean;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=/scenarios/${scenarioId}`);
      return;
    }
    setFavorited((v) => !v); // 即座に見た目を反映(楽観的更新)
    startTransition(async () => {
      await toggleFavorite(scenarioId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      className={`flex items-center gap-1.5 rounded-md border px-4 py-2 text-xs transition-colors disabled:opacity-60 ${
        favorited
          ? "border-accent bg-accent-bg text-accent"
          : "border-line-strong text-ink-sub hover:bg-bg"
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      </svg>
      {favorited ? "お気に入り済み" : "お気に入りに追加"}
    </button>
  );
}
