"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "./actions";

const initialState: ContactState = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-ok-bg bg-ok-bg p-6 text-center text-[13px] text-ok">
        送信しました。内容を確認のうえ対応します（個別の返信はメールアドレスをご記入いただいた場合のみです）。
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-xl border border-line bg-panel p-6">
      <label className="mb-1 block text-xs font-bold text-ink-sub">
        メールアドレス
        <span className="ml-1 font-normal text-ink-faint">
          （任意・返信が必要な場合のみ。空欄でも送信できます）
        </span>
      </label>
      <input
        type="email"
        name="email"
        placeholder="example@mail.com"
        className="mb-4 w-full rounded-md border border-line-strong px-3 py-2 text-[13px] outline-none focus:border-accent"
      />

      <label className="mb-1 block text-xs font-bold text-ink-sub">内容</label>
      <textarea
        name="message"
        required
        rows={7}
        maxLength={2000}
        placeholder="不具合の内容、ご要望、その他何でもお書きください"
        className="mb-1 w-full rounded-md border border-line-strong px-3 py-2 text-[13px] outline-none focus:border-accent"
      />
      {state.error && <p className="mb-2 text-[11.5px] text-accent">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-3 rounded-md bg-accent px-6 py-2.5 text-[13px] text-white disabled:opacity-60"
      >
        {isPending ? "送信中…" : "送信する"}
      </button>
    </form>
  );
}
