"use client";

import { useState } from "react";
import { SearchForm } from "./search-form";

/**
 * スマホ幅(md未満)でヘッダーの検索欄を格納するハンバーガーメニュー。
 * デスクトップ幅ではヘッダーに検索欄がそのまま表示されるため、
 * このボタン自体もmd:hiddenで非表示になる。
 */
export function MobileSearchToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "検索メニューを閉じる" : "検索メニューを開く"}
        aria-expanded={open}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-ink-sub hover:bg-bg md:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-line bg-panel px-6 py-4 shadow-md md:hidden">
          <SearchForm className="flex" autoFocus />
        </div>
      )}
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}
