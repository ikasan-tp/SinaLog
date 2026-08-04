import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line px-6 py-8 text-center text-xs text-ink-faint">
      <p>シナログ（Sinalog）── クトゥルフ神話TRPGシナリオレビューサイト（非公式・ファンプロジェクト）</p>
      <p className="mt-2 space-x-3">
        <Link href="/help" className="hover:text-accent">ヘルプ</Link>
        <Link href="/terms" className="hover:text-accent">利用規約・プライバシーポリシー</Link>
        <Link href="/excluded-authors" className="hover:text-accent">掲載不可作者一覧</Link>
      </p>
    </footer>
  );
}
