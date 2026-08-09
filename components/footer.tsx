import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line px-6 py-8 text-center text-xs text-ink-faint">
      <p>SinaLog── クトゥルフ神話TRPGシナリオレビューサイト（非公式・ファンプロジェクト）</p>
      <p className="mt-2 space-x-3">
        <Link href="/help" className="hover:text-accent">ヘルプ</Link>
        <Link href="/terms" className="hover:text-accent">利用規約・プライバシーポリシー</Link>
        <Link href="/excluded-authors" className="hover:text-accent">掲載不可作者一覧</Link>
      </p>
      <p className="mx-auto mt-5 max-w-2xl text-pretty border-t border-line pt-5 text-[10.5px] leading-relaxed text-ink-faint">
        本サイトは、「株式会社アークライト」及び「株式会社KADOKAWA」が権利を有する『クトゥルフ神話TRPG』シリーズの二次創作物です。
        <br />
        Call of Cthulhu is copyright ©1981, 2015, 2019 by Chaosium Inc.; all rights reserved. Arranged by
        Arclight Inc. Call of Cthulhu is a registered trademark of Chaosium Inc.
        <br />
        PUBLISHED BY KADOKAWA CORPORATION　「クトゥルフ神話TRPG」「新クトゥルフ神話TRPG」
      </p>
    </footer>
  );
}
