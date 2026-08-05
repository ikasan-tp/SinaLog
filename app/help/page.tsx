import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const sections = [
  {
    id: "basic",
    title: "基本の使い方",
    items: [
      ["会員登録は必要ですか？", "シナリオを閲覧するだけなら登録は不要です。レビューの投稿やシナリオ登録を行う場合のみログインが必要です。"],
      ["ログインに必要なものは？", "Googleアカウント、またはメールアドレスがあればログインできます。メールログインではパスワードの設定は不要です。"],
    ],
  },
  {
    id: "review",
    title: "レビューについて",
    items: [
      ["低い評価のレビューは書いてよいですか？", "問題ありません。人格攻撃ではなく、どの点が合わなかったかを具体的に書いてください。"],
      ["投稿したレビューを編集できますか？", "マイページから投稿済みレビューを確認し、必要に応じて編集・削除できる想定です。"],
    ],
  },
  {
    id: "scenario",
    title: "シナリオ登録について",
    items: [
      ["作者本人でなくても登録できますか？", "公開情報をもとにした紹介として登録できます。ただし、作者が掲載を望まない場合は掲載停止の対象になります。"],
      ["BOOTHなどのURLは必要ですか？", "配布ページや告知ページなど、シナリオを確認できるURLを登録してください。"],
    ],
  },
  {
    id: "moderation",
    title: "通報・要素タグについて",
    items: [
      ["問題のあるレビューを見つけました。", "レビューの通報機能から理由を送信してください。運営側で確認し、必要に応じて非表示対応を行います。"],
      ["要素タグはネタバレになりませんか？", "プレイ前の判断材料として扱える範囲に留め、核心的なネタバレはレビュー本文側で分けてください。"],
    ],
  },
];

export default function Page() {
  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-[820px] flex-1 gap-8 px-5 py-9 md:grid-cols-[180px_1fr] md:px-6">
        <aside className="rounded-lg border border-line bg-panel p-4 text-[12.5px] md:sticky md:top-24 md:self-start md:border-0 md:bg-transparent md:p-0">
          <div className="mb-2 text-xs font-bold text-ink-faint">目次</div>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="block py-1 text-ink-sub hover:text-accent">
              {section.title}
            </a>
          ))}
          <a href="#contact" className="block py-1 text-ink-sub hover:text-accent">お問い合わせ</a>
        </aside>

        <article className="text-[13.5px] leading-8">
          <h1 className="mb-2 text-2xl font-bold">ヘルプ</h1>
          <p className="mb-8 text-xs text-ink-faint">
            よくある質問をまとめています。規約について知りたい場合は
            <Link href="/terms" className="text-link underline">利用規約・プライバシーポリシー</Link>
            をご覧ください。
          </p>

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className={index === 0 ? "scroll-mt-24" : "mt-9 scroll-mt-24 border-t border-line pt-5"}>
              <h2 className="mb-3 text-[15px] font-bold">{section.title}</h2>
              <div className="space-y-5">
                {section.items.map(([question, answer]) => (
                  <div key={question}>
                    <div className="mb-1 flex gap-2 font-bold">
                      <span className="text-accent">Q.</span>
                      <span>{question}</span>
                    </div>
                    <p className="pl-6 text-[13px] text-ink-sub">{answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section id="contact" className="mt-9 scroll-mt-24 border-t border-line pt-5">
            <h2 className="mb-3 text-[15px] font-bold">お問い合わせ</h2>
            <div className="rounded-lg border border-line bg-panel p-5">
              <p className="mb-4 text-[12.5px] text-ink-sub">
                掲載停止、権利者からの連絡、通報に関する補足はお問い合わせフォームからご連絡ください。
              </p>
              <Link href="/excluded-authors" className="inline-block rounded-md bg-accent px-5 py-2.5 text-[13px] text-white hover:bg-accent-hover">
                掲載停止について確認する
              </Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

