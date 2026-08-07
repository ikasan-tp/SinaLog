/**
 * ヘッダーの検索フォーム。デスクトップ表示・スマホのハンバーガーメニュー内、
 * 両方から共通で使う。サーバー専用の依存を持たないプレーンなコンポーネントにして、
 * クライアントコンポーネント(mobile-search-toggle.tsx)からも安全にimportできるようにしている。
 */
export function SearchForm({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  return (
    <form action="/search" method="get" className={className}>
      <input
        type="text"
        name="q"
        placeholder="シナリオ名・作者名で検索"
        autoFocus={autoFocus}
        className="w-full min-w-0 rounded-l-md border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-accent md:py-2"
      />
      <button
        type="submit"
        className="flex-shrink-0 rounded-r-md border border-l-0 border-line-strong px-4 text-sm text-ink-sub hover:bg-bg"
      >
        検索
      </button>
    </form>
  );
}
