import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const TOC = [
  { id: "terms", label: "利用規約" },
  { id: "post-rules", label: "投稿に関するルール" },
  { id: "prohibited", label: "禁止事項" },
  { id: "reports", label: "通報・非表示の運用" },
  { id: "rights", label: "著作権について" },
  { id: "disclaimer", label: "免責事項" },
  { id: "exclusion", label: "掲載の停止について" },
  { id: "privacy", label: "プライバシーポリシー" },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-9 px-6 py-9 md:grid-cols-[160px_1fr]">
        <nav className="text-[12.5px] md:sticky md:top-24 md:self-start">
          <div className="mb-3 text-xs font-bold text-ink-faint">目次</div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 md:block md:space-y-0.5">
            {TOC.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="block py-1 text-ink-sub hover:text-accent">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-pretty leading-[1.9]">
          <h1 className="mb-2 text-2xl font-bold">利用規約・プライバシーポリシー</h1>
          <p className="mb-8 text-xs text-ink-faint">最終更新日：2026年7月19日</p>

          <Section id="terms" title="1. 利用規約について" first>
            <p>
              この利用規約（以下「本規約」）は、SinaLog（以下「当サイト」）の利用条件を定めるものです。登録・閲覧・投稿を行った時点で、本規約に同意したものとみなします。
            </p>
            <p>
              当サイトは個人が運営するファンプロジェクトであり、クトゥルフ神話TRPGの権利元・各シナリオの作者・頒布プラットフォームとは関係ありません。
            </p>
          </Section>

          <Section id="post-rules" title="2. 投稿に関するルール">
            <p>レビューやシナリオ情報の投稿にあたっては、以下を守ってください。</p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>実際にプレイした（またはキーパーとして進行した）内容にもとづいて投稿してください</li>
              <li>ネタバレを含む感想は、必ず専用の入力欄に記載してください</li>
              <li>
                注意書き（content warning）に関する申告は、内容の核心に触れずカテゴリの選択にとどめてください
              </li>
              <li>他者の作品・レビューの文章を無断で転載しないでください</li>
            </ul>
          </Section>

          <Section id="prohibited" title="3. 禁止事項">
            <p>以下の行為を禁止します。発見した場合、投稿の削除やアカウントの利用制限を行うことがあります。</p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>他の利用者・作者への誹謗中傷、人格攻撃</li>
              <li>虚偽の内容にもとづくレビューや報告</li>
              <li>スパム投稿、宣伝目的のみの投稿</li>
              <li>著作権・知的財産権を侵害する内容の投稿</li>
              <li>本人になりすます行為、複数アカウントを用いた不正な評価操作</li>
            </ul>
          </Section>

          <Section id="reports" title="4. 通報・非表示の運用">
            <p>レビューへの通報や、引用・参考元に関する集計について、以下の方針で運用します。</p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>レビューへの通報は、運営が内容を確認したうえで非表示の判断を行います</li>
              <li>
                元ネタ・引用に関する集計は、レビュー投稿時の設問への回答を集計して表示します。特定の申告をもって「盗作である」と断定する機能ではありません
              </li>
              <li>
                「参照の仕方に少し引っかかりを感じた」の回答が多い場合も、事実の断定ではなく回答の分布として表示されます
              </li>
              <li>
                著作権上の懸念など、集計とは別に個別の申し立てが必要な場合は、お問い合わせより直接ご連絡ください
              </li>
              <li>虚偽・悪意にもとづく通報が確認された場合、通報者側の利用を制限することがあります</li>
            </ul>
            <p className="mt-3.5 rounded-lg border border-line-strong bg-panel p-4 text-[12.5px] text-ink-sub">
              通報・報告に関する運用は、サイトの利用状況に応じて見直す場合があります。変更内容は本ページで随時更新します。
            </p>
          </Section>

          <Section id="rights" title="5. 著作権について">
            <p>
              投稿されたレビュー・紹介文の著作権は、投稿者本人に帰属します。ただし、当サイト上での表示・保管・改変（表記調整等）について、投稿者は当サイトに利用を許諾するものとします。
            </p>
            <p>
              シナリオのサムネイル画像は、頒布ページ（BOOTH等）の画像を直接参照する形で表示しており、当サイトのサーバーに複製・保存はしていません。
            </p>
            <div className="mt-3.5 rounded-lg border border-line-strong bg-panel p-4 text-[12.5px] leading-relaxed text-ink-sub">
              <p>
                本サイトは、「株式会社アークライト」及び「株式会社KADOKAWA」が権利を有する『クトゥルフ神話TRPG』シリーズの二次創作物です。
              </p>
              <p className="mt-2">
                Call of Cthulhu is copyright ©1981, 2015, 2019 by Chaosium Inc.; all rights reserved. Arranged by
                Arclight Inc.
                <br />
                Call of Cthulhu is a registered trademark of Chaosium Inc.
                <br />
                PUBLISHED BY KADOKAWA CORPORATION　「クトゥルフ神話TRPG」「新クトゥルフ神話TRPG」
              </p>
            </div>
          </Section>

          <Section id="disclaimer" title="6. 免責事項">
            <p>
              当サイトに掲載される情報（レビュー内容、評価、注意書きに関する報告等）は、投稿者個人の見解であり、当サイトがその正確性を保証するものではありません。
            </p>
            <p>当サイトの利用によって生じたいかなる損害についても、運営者は責任を負いかねます。</p>
          </Section>

          <Section id="exclusion" title="7. 掲載の停止について">
            <p>
              無料公開されているシナリオについては、作者・サークルご本人からの申し出により、当サイトへの新規掲載およびレビュー投稿の受付を停止します。対象のシナリオページおよび関連するレビューを非公開にし、
              <Link href="/excluded-authors" className="text-link underline">
                掲載不可作者一覧
              </Link>
              に追加します。
            </p>
            <p>
              一方、有償頒布されているシナリオについては、購入を検討する方にとってレビューが重要な判断材料となることから、原則として掲載停止の対象外とします。ただし、著作権侵害や法令違反など、運営が対応の必要があると判断した場合は、個別に対応することがあります。
            </p>
          </Section>

          <Section id="privacy" title="8. プライバシーポリシー">
            <p>
              当サイトのログインには、Googleアカウント認証、またはメールアドレス宛に送るログイン用リンク（パスワード不要）のいずれかをご利用いただけます。いずれの方法でも、当サイト側でパスワードを保管することはありません。取得した情報（表示名・メールアドレス）は以下の目的のみに利用します。
            </p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>ログイン認証、アカウント管理</li>
              <li>ログイン用リンクの送信（メールアドレスでログインする場合のみ）</li>
              <li>通報・お問い合わせへの対応連絡</li>
            </ul>
            <p>通報の対応結果やお知らせは、個別のメール送信ではなくサイト内の表示でお伝えします。</p>
            <p>
              表示名・アイコン・自己紹介・好きな傾向タグ・お気に入りに登録したシナリオ・累計の参考になった数は、公開プロフィールページとして誰でも閲覧できます。メールアドレスなど、これら以外の登録情報を公開することはありません。
            </p>
            <p>取得した個人情報を、本人の同意なく第三者に提供することはありません。法令にもとづく開示請求があった場合を除きます。</p>
            <p>アカウントの削除をご希望の場合、マイページの設定、またはお問い合わせよりご連絡ください。</p>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  id,
  title,
  first,
  children,
}: {
  id: string;
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 space-y-2.5 text-[13.5px] text-ink ${
        first ? "" : "mt-9 border-t border-line pt-9"
      }`}
    >
      <h2 className="mb-1 text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}
