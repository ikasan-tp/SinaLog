"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleHelpful } from "./actions";
import { toggleContextFlag } from "./context-flag-actions";
import { reportReview, type ReportReviewState } from "./report-actions";

const ROLE_LABEL: Record<string, string> = { pl: "PLとして参加", kp: "KPとして進行" };
const MOD_LABEL: Record<string, string> = { none: "原文通り", partial: "一部改変", major: "大幅に改変" };
const FORMAT_LABEL: Record<string, string> = { text: "テキセ", voice: "ボイセ", inperson: "対面" };

type ReviewRow = {
  id: string;
  user_id: string | null;
  role: string;
  play_format: string;
  modification: string;
  recommend: boolean;
  good_point: string;
  concern_point: string | null;
  spoiler_text: string | null;
  helpful_count: number;
  created_at: string;
  isOwnReview: boolean;
  myVote: boolean;
  myContextFlag: boolean;
  contextFlagCount: number;
  users: {
    display_name: string;
    avatar_icon: string;
    avatar_color: string;
  } | null;
};

export function ReviewCard({
  review,
  scenarioId,
  isLoggedIn,
}: {
  review: ReviewRow;
  scenarioId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [spoilerOpen, setSpoilerOpen] = useState(false);

  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [voted, setVoted] = useState(review.myVote);
  const [isVotePending, startVoteTransition] = useTransition();

  const [flagCount, setFlagCount] = useState(review.contextFlagCount);
  const [flagged, setFlagged] = useState(review.myContextFlag);
  const [isFlagPending, startFlagTransition] = useTransition();

  const [reportOpen, setReportOpen] = useState(false);

  const boundReport = reportReview.bind(null, review.id, scenarioId);
  const [reportState, reportAction, isReporting] = useActionState<ReportReviewState, FormData>(
    boundReport,
    {}
  );

  function handleHelpful() {
    if (!isLoggedIn) {
      router.push(`/login?next=/scenarios/${scenarioId}`);
      return;
    }
    if (review.isOwnReview || isVotePending) return;

    // 楽観的更新。失敗したら元に戻す。
    const nextVoted = !voted;
    setVoted(nextVoted);
    setHelpfulCount((c) => (nextVoted ? c + 1 : Math.max(c - 1, 0)));
    startVoteTransition(async () => {
      const result = await toggleHelpful(review.id, scenarioId);
      if (result.error) {
        setVoted(voted);
        setHelpfulCount(review.helpful_count);
      }
    });
  }

  function handleContextFlag() {
    if (!isLoggedIn) {
      router.push(`/login?next=/scenarios/${scenarioId}`);
      return;
    }
    if (review.isOwnReview || isFlagPending) return;

    const nextFlagged = !flagged;
    setFlagged(nextFlagged);
    setFlagCount((c) => (nextFlagged ? c + 1 : Math.max(c - 1, 0)));
    startFlagTransition(async () => {
      const result = await toggleContextFlag(review.id, scenarioId);
      if (result.error) {
        setFlagged(flagged);
        setFlagCount(review.contextFlagCount);
      }
    });
  }

  const date = new Date(review.created_at).toLocaleDateString("ja-JP");
  const displayName = review.user_id ? review.users?.display_name ?? "名無しの探索者" : "匿名さん";
  const avatarColor = review.user_id ? review.users?.avatar_color ?? "#7A2430" : "#6B675E";

  const authorInfo = (
    <>
      <div
        className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
        style={{ backgroundColor: `${avatarColor}1A`, color: avatarColor }}
      >
        {displayName.slice(0, 1)}
      </div>
      <span className="text-[13px] font-medium">{displayName}</span>
      <span className="text-[11px] text-ink-faint">{date}</span>
    </>
  );

  return (
    <div className="border-b border-line py-4.5 py-[18px] last:border-0">
      <div className="mb-2 flex items-center justify-between">
        {review.user_id ? (
          <Link href={`/u/${review.user_id}`} className="flex items-center gap-2 hover:opacity-80">
            {authorInfo}
          </Link>
        ) : (
          <div className="flex items-center gap-2">{authorInfo}</div>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            review.recommend ? "bg-ok-bg text-ok" : "bg-accent-bg text-accent"
          }`}
        >
          {review.recommend ? "おすすめ" : "おすすめしない"}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        <span className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-tag-ink">
          {ROLE_LABEL[review.role]}
        </span>
        <span className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-tag-ink">
          {FORMAT_LABEL[review.play_format]}
        </span>
        <span className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-tag-ink">
          {MOD_LABEL[review.modification]}
        </span>
      </div>

      <p className="text-[13px] leading-relaxed">{review.good_point}</p>

      {review.concern_point && (
        <p className="mt-2 text-[13px] leading-relaxed text-ink-sub">
          気になった点：{review.concern_point}
        </p>
      )}

      {review.spoiler_text && (
        <div className="mt-2.5 rounded-lg border border-line-strong bg-bg p-4">
          <button
            type="button"
            onClick={() => setSpoilerOpen((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <span className="text-xs text-ink-sub">ネタバレを含む感想（真相・展開に関する記述）</span>
            <span className="rounded-md border border-line-strong px-3.5 py-1.5 text-xs text-accent">
              {spoilerOpen ? "閉じる" : "表示する"}
            </span>
          </button>
          {spoilerOpen && (
            <p className="mt-3 border-t border-line-strong pt-3 text-[13px] leading-relaxed">
              {review.spoiler_text}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleHelpful}
            disabled={review.isOwnReview || isVotePending}
            title={review.isOwnReview ? "自分のレビューには投票できません" : undefined}
            className={`flex items-center gap-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50 ${
              voted ? "text-link" : "text-ink-faint hover:text-ink-sub"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10v11" />
              <path d="M2 10h4v11H2V10Z" />
              <path d="M7 10l3-8a2 2 0 0 1 2 2v5h6.3a2 2 0 0 1 2 2.4l-1.5 7A2 2 0 0 1 17 21H7" />
            </svg>
            参考になった（{helpfulCount}）
          </button>

          <button
            type="button"
            onClick={handleContextFlag}
            disabled={review.isOwnReview || isFlagPending}
            title={
              review.isOwnReview
                ? "自分のレビューには使えません"
                : "このレビューの評価は、シナリオ自体よりKP・卓環境・参加者などプレイ状況の影響が大きいかもしれない、と感じたときに"
            }
            className={`flex items-center gap-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-50 ${
              flagged ? "text-[#8A5A1E]" : "text-ink-faint hover:text-ink-sub"
            }`}
          >
            シナリオ以外の要因が大きそう
            {flagCount > 0 && <span className="text-ink-faint">（{flagCount}）</span>}
          </button>
        </div>

        {!reportState.success && (
          <button
            type="button"
            onClick={() => setReportOpen((v) => !v)}
            className="text-[11px] text-ink-faint hover:text-accent hover:underline"
          >
            {reportOpen ? "閉じる" : "通報する"}
          </button>
        )}
      </div>

      {reportState.success ? (
        <p className="mt-2.5 rounded-md bg-bg px-3 py-2 text-[11px] text-ink-faint">
          通報しました。運営が内容を確認します。
        </p>
      ) : (
        reportOpen && (
          <form action={reportAction} className="mt-2.5 rounded-md border border-line-strong bg-bg p-3.5">
            <div className="mb-2 text-[11px] font-medium text-ink-sub">通報理由を選んでください</div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {["誹謗中傷", "スパム・宣伝", "個人情報の記載", "その他"].map((r) => (
                <label key={r} className="cursor-pointer">
                  <input type="radio" name="reason" value={r} className="peer hidden" required />
                  <span className="rounded-full border border-line-strong px-3 py-1 text-[11px] text-ink-sub peer-checked:border-accent peer-checked:bg-accent-bg peer-checked:text-accent">
                    {r}
                  </span>
                </label>
              ))}
            </div>
            <textarea
              name="comment"
              placeholder="補足があれば（任意）"
              rows={2}
              className="mb-2 w-full rounded-md border border-line-strong px-2.5 py-2 text-[11px] outline-none focus:border-accent"
            />
            {reportState.error && (
              <p className="mb-2 text-[11px] text-accent">{reportState.error}</p>
            )}
            <button
              type="submit"
              disabled={isReporting}
              className="rounded-md bg-accent px-3.5 py-1.5 text-[11px] text-white disabled:opacity-60"
            >
              {isReporting ? "送信中…" : "通報する"}
            </button>
          </form>
        )
      )}
    </div>
  );
}
