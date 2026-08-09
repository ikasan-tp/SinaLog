"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteMyReview, deleteMyScenario, removeFavorite, updateFavoriteNote } from "./actions";

type ReviewRow = {
  id: string;
  good_point: string;
  recommend: boolean;
  helpful_count: number;
  created_at: string;
  is_hidden: boolean;
  scenarios: { id: string; title: string; system_version: string | null } | null;
};

type FavoriteRow = {
  scenario_id: string;
  note: string | null;
  created_at: string;
  scenarios: { id: string; title: string; system_version: string | null; price_text: string } | null;
};

type ScenarioRow = {
  id: string;
  title: string;
  system_version: string | null;
  price_text: string;
  is_hidden: boolean;
  created_at: string;
  reviewCount: number;
};

type Tab = "reviews" | "favorites" | "scenarios" | "settings";

const TABS: { key: Tab; label: (n: number) => string }[] = [
  { key: "reviews", label: (n) => `投稿したレビュー (${n})` },
  { key: "favorites", label: (n) => `好きなシナリオ (${n})` },
  { key: "scenarios", label: (n) => `登録したシナリオ (${n})` },
  { key: "settings", label: () => "アカウント設定" },
];

export function MypageTabs({
  reviews,
  favorites,
  scenarios,
  settingsContent,
}: {
  reviews: ReviewRow[];
  favorites: FavoriteRow[];
  scenarios: ScenarioRow[];
  settingsContent: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("reviews");
  const counts: Record<Tab, number> = {
    reviews: reviews.length,
    favorites: favorites.length,
    scenarios: scenarios.length,
    settings: 0,
  };

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-[13px] transition-colors ${
              tab === t.key
                ? "border-accent font-bold text-accent"
                : "border-transparent text-ink-faint hover:text-ink-sub"
            }`}
          >
            {t.label(counts[t.key])}
          </button>
        ))}
      </div>

      {tab === "reviews" && <ReviewsPanel reviews={reviews} />}
      {tab === "favorites" && <FavoritesPanel favorites={favorites} />}
      {tab === "scenarios" && <ScenariosPanel scenarios={scenarios} />}
      {tab === "settings" && settingsContent}
    </div>
  );
}

function ReviewsPanel({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return (
      <EmptyState>
        まだレビューを投稿していません。気に入ったシナリオがあれば、感想を書いてみませんか？
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewRowItem key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewRowItem({ review }: { review: ReviewRow }) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);
  const scenario = review.scenarios;

  function handleDelete() {
    if (!confirm("このレビューを削除しますか？この操作は取り消せません。")) return;
    startTransition(async () => {
      await deleteMyReview(review.id);
      setRemoved(true);
    });
  }

  if (removed) return null;

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {scenario ? (
            <Link href={`/scenarios/${scenario.id}`} className="text-sm font-bold hover:text-accent">
              {scenario.title}
            </Link>
          ) : (
            <span className="text-sm font-bold text-ink-faint">（削除されたシナリオ）</span>
          )}
          <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-faint">
            <span className={review.recommend ? "text-ok" : "text-accent"}>
              {review.recommend ? "おすすめ" : "おすすめしない"}
            </span>
            <span>参考になった {review.helpful_count}</span>
            {review.is_hidden && <span className="text-accent">非公開中</span>}
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          {scenario && (
            <Link
              href={`/scenarios/${scenario.id}/review/new`}
              className="rounded-md border border-line-strong px-3 py-1.5 text-[11.5px] text-ink-sub hover:bg-bg"
            >
              編集
            </Link>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-md border border-line-strong px-3 py-1.5 text-[11.5px] text-ink-sub hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {isPending ? "削除中…" : "削除"}
          </button>
        </div>
      </div>
      <p className="line-clamp-2 text-[12.5px] text-ink-sub">{review.good_point}</p>
    </div>
  );
}

function FavoritesPanel({ favorites }: { favorites: FavoriteRow[] }) {
  if (favorites.length === 0) {
    return (
      <EmptyState>
        まだお気に入りに追加したシナリオがありません。シナリオ詳細ページの「お気に入りに追加」から登録できます。
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      {favorites.map((fav) => (
        <FavoriteRowItem key={fav.scenario_id} favorite={fav} />
      ))}
    </div>
  );
}

function FavoriteRowItem({ favorite }: { favorite: FavoriteRow }) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [note, setNote] = useState(favorite.note ?? "");
  const scenario = favorite.scenarios;

  function handleRemove() {
    startTransition(async () => {
      await removeFavorite(favorite.scenario_id);
      setRemoved(true);
    });
  }

  function handleSaveNote() {
    startTransition(async () => {
      await updateFavoriteNote(favorite.scenario_id, note);
      setEditingNote(false);
    });
  }

  if (removed) return null;

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {scenario ? (
            <Link href={`/scenarios/${scenario.id}`} className="text-sm font-bold hover:text-accent">
              {scenario.title}
            </Link>
          ) : (
            <span className="text-sm font-bold text-ink-faint">（削除されたシナリオ）</span>
          )}
          {scenario?.system_version && (
            <div className="mt-1 text-[11px] text-ink-faint">{scenario.system_version}</div>
          )}
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditingNote((v) => !v)}
            className="rounded-md border border-line-strong px-3 py-1.5 text-[11.5px] text-ink-sub hover:bg-bg"
          >
            {favorite.note ? "メモを編集" : "メモを書く"}
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="rounded-md border border-line-strong px-3 py-1.5 text-[11.5px] text-ink-sub hover:border-accent hover:text-accent disabled:opacity-60"
          >
            解除
          </button>
        </div>
      </div>

      {editingNote ? (
        <div className="mt-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="例：短時間で遊べて、余韻の残るエンディングが好き。初心者にもよく勧めています。"
            className="w-full rounded-md border border-line-strong px-3 py-2 text-[12.5px] outline-none focus:border-accent"
          />
          <div className="mt-1.5 flex gap-2">
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={isPending}
              className="rounded-md bg-accent px-3 py-1.5 text-[11.5px] text-white disabled:opacity-60"
            >
              {isPending ? "保存中…" : "保存"}
            </button>
            <button
              type="button"
              onClick={() => {
                setNote(favorite.note ?? "");
                setEditingNote(false);
              }}
              className="rounded-md border border-line-strong px-3 py-1.5 text-[11.5px] text-ink-sub hover:bg-bg"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        favorite.note && <p className="text-pretty text-[12.5px] text-ink-sub">{favorite.note}</p>
      )}
    </div>
  );
}

function ScenariosPanel({ scenarios }: { scenarios: ScenarioRow[] }) {
  if (scenarios.length === 0) {
    return (
      <EmptyState>
        まだ登録したシナリオがありません。遊んだシナリオがサイトに無ければ、あなたが最初の登録者になれます。
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      {scenarios.map((scenario) => (
        <ScenarioRowItem key={scenario.id} scenario={scenario} />
      ))}
    </div>
  );
}

function ScenarioRowItem({ scenario }: { scenario: ScenarioRow }) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState("");

  const hasReviews = scenario.reviewCount > 0;

  function handleDelete() {
    if (hasReviews) return;
    if (!confirm("このシナリオの登録情報を削除しますか？この操作は取り消せません。")) return;
    setError("");
    startTransition(async () => {
      const result = await deleteMyScenario(scenario.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setRemoved(true);
    });
  }

  if (removed) return null;

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/scenarios/${scenario.id}`} className="text-sm font-bold hover:text-accent">
            {scenario.title}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-faint">
            {scenario.system_version && <span>{scenario.system_version}</span>}
            <span>{scenario.price_text}</span>
            <span>レビュー{scenario.reviewCount}件</span>
            {scenario.is_hidden && <span className="text-accent">非公開中</span>}
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Link
            href={`/scenarios/${scenario.id}`}
            className="rounded-md border border-line-strong px-3 py-1.5 text-[11.5px] text-ink-sub hover:bg-bg"
          >
            ページを見る
          </Link>
          <Link
            href={`/scenarios/${scenario.id}/edit`}
            className="rounded-md border border-line-strong px-3 py-1.5 text-[11.5px] text-ink-sub hover:bg-bg"
          >
            情報を編集
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending || hasReviews}
            title={hasReviews ? "レビューが投稿されているシナリオは削除できません" : undefined}
            className="rounded-md border border-line-strong px-3 py-1.5 text-[11.5px] text-ink-sub hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-ink-sub"
          >
            {isPending ? "削除中…" : "削除"}
          </button>
        </div>
      </div>
      {hasReviews && (
        <p className="mt-2.5 text-[11px] text-ink-faint">
          レビューが投稿されているシナリオは削除できません。掲載を停止したい場合は
          <Link href="/help" className="underline hover:text-accent">
            ヘルプ
          </Link>
          をご確認ください。
        </p>
      )}
      {error && <p className="mt-2.5 text-[11px] text-accent">{error}</p>}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-bg p-8 text-center text-pretty text-[13px] text-ink-faint">
      {children}
    </div>
  );
}
