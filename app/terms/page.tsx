import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const sections = [
  ["terms", "利用規約", "シナログは、クトゥルフ神話TRPG等のシナリオについて、プレイヤー・キーパーが感想や判断材料を共有するための非公式レビューサイトです。"],
  ["post-rules", "投稿に関するルール", "投稿内容は、実際のプレイ体験や確認できる公開情報にもとづいてください。ネタバレを含む内容は、指定された入力欄に分けて投稿してください。"],
  ["prohibited", "禁止事項", "作者・投稿者・第三者への誹謗中傷、権利侵害、虚偽情報、過度に攻撃的な表現、スパム行為は禁止します。"],
  ["reports", "通報・非表示の運用", "通報された投稿は内容を確認し、必要に応じて非表示化や修正依頼を行います。対応基準や個別判断の詳細は公開しない場合があります。"],
  ["rights", "著作権について", "シナリオ本文、画像、配布ページ等の著作権は各権利者に帰属します。シナログ上の投稿文の権利は投稿者に帰属します。"],
  ["disclaimer", "免責事項", "掲載情報の正確性・完全性を保証するものではありません。シナリオ購入やプレイ判断は、各配布元の情報もあわせてご確認ください。"],
  ["exclusion", "掲載の停止について", "作者または権利者が掲載を望まない場合、掲載停止や検索対象からの除外を申請できます。"],
  ["privacy", "プライバシーポリシー", "ログイン、投稿、通報、問い合わせのために必要な範囲でアカウント情報や投稿情報を扱います。取得した情報はサービス運営、問い合わせ対応、不正利用防止の目的で利用します。"],
];

export default function Page() {
  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-[820px] flex-1 gap-8 px-5 py-9 md:grid-cols-[180px_1fr] md:px-6">
        <aside className="rounded-lg border border-line bg-panel p-4 text-[12.5px] md:sticky md:top-24 md:self-start md:border-0 md:bg-transparent md:p-0">
          <div className="mb-2 text-xs font-bold text-ink-faint">目次</div>
          {sections.map(([id, title]) => (
            <a key={id} href={`#${id}`} className="block py-1 text-ink-sub hover:text-accent">
              {title}
            </a>
          ))}
        </aside>

        <article className="text-[13.5px] leading-8">
          <h1 className="mb-2 text-2xl font-bold">利用規約・プライバシーポリシー</h1>
          <p className="mb-8 text-xs text-ink-faint">最終更新日：2026年7月19日</p>

          <div className="mb-6 rounded-lg border border-line-strong bg-panel p-4 text-[12.5px] text-ink-sub">
            本ページはサービス運営のための基本方針です。掲載停止に関する案内は
            <Link href="/excluded-authors" className="text-link underline">掲載不可作者一覧</Link>
            もご確認ください。
          </div>

          {sections.map(([id, title, body], index) => (
            <section key={id} id={id} className={index === 0 ? "scroll-mt-24" : "mt-9 scroll-mt-24 border-t border-line pt-5"}>
              <h2 className="mb-3 text-base font-bold">{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}

