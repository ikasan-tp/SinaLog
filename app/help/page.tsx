import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const TOC = [
  { id: "basic", label: "基本の使い方" },
  { id: "review", label: "レビューについて" },
  { id: "helpful", label: "参考になった・公開プロフィール" },
  { id: "scenario", label: "シナリオ登録について" },
  { id: "moderation", label: "通報・要素タグについて" },
  { id: "account", label: "アカウントについて" },
  { id: "contact", label: "お問い合わせ" },
];

export default function HelpPage() {
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

        <div className="text-pretty">
          <h1 className="mb-2 text-2xl font-bold">ヘルプ</h1>
          <p className="mb-8 text-xs leading-relaxed text-ink-faint">
            よくある質問をまとめています。規約について知りたい場合は
            <Link href="/terms" className="text-link underline">
              利用規約・プライバシーポリシー
            </Link>
            をご覧ください。
          </p>

          <Section id="basic" title="基本の使い方" first>
            <Faq q="会員登録は必要ですか？">
              シナリオの閲覧やレビューの投稿はログインなしでもできます。お気に入り登録・シナリオ登録・投稿したレビューの後からの編集・削除にはログインが必要です。
            </Faq>
            <Faq q="ログインに必要なものは？">
              Googleアカウント、またはメールアドレスのどちらかがあればログインできます。パスワードの設定は不要です（メールで届くリンクからログインします）。
            </Faq>
          </Section>

          <Section id="review" title="レビューについて">
            <Faq q="低い評価のレビューは書きにくいのですが。">
              SinaLogでは「良かった点」を必須、「気になった点」を任意にしています。良かった点が見つからない場合でも、シナリオのどの部分がどうだったかを具体的に書いていただければ十分です。人格攻撃にあたる内容は削除の対象になります。
            </Faq>
            <Faq q="低評価のレビューが見当たりません。">
              シナリオ詳細ページのレビュー一覧は、初期状態で厳しめの評価を含めない表示になっています。「気になる点も含む」タブに切り替えると確認できます。
            </Faq>
            <Faq q="投稿したレビューを編集・削除したい。">
              <Link href="/mypage" className="underline">
                マイページ
              </Link>
              の「投稿したレビュー」から、いつでも編集・削除できます。
            </Faq>
          </Section>

          <Section id="helpful" title="参考になった・公開プロフィール">
            <Faq q="「参考になった」を押すとどうなりますか？">
              押した数の合計が、投稿者の公開プロフィールで表示名の右に小さく表示されます。1つのレビューにつき1人1回までで、もう一度押すと取り消せます。自分自身のレビューには押せません。
            </Faq>
            <Faq q="「シナリオ以外の要因が大きそう」とは何ですか？">
              レビューの評価が、シナリオそのものよりKP・卓の雰囲気・参加者・プレイ状況といった要因による可能性がある、と感じたときに使うボタンです。「参考になった」や通報とは完全に別の集計で、レビューの削除や評価には一切影響しません。あくまで読み手への参考情報です。
            </Faq>
            <Faq q="公開プロフィール（/u/...）には何が表示されますか？">
              アイコン・表示名（右に参考になった数）・自己紹介・好きな傾向タグ・お気に入りに登録したシナリオが表示されます。個別のレビュー本文は表示されません。
            </Faq>
            <Faq q="公開プロフィールを見られたくありません。">
              現在、自己紹介・好きな傾向タグ・お気に入りは仕様上どなたでも閲覧できます。表示したくない項目がある場合は、
              <Link href="/mypage" className="underline">
                マイページ
              </Link>
              で自己紹介やタグを空にしておくか、お気に入りを解除しておくことで非表示にできます。
            </Faq>
          </Section>

          <Section id="scenario" title="シナリオ登録について">
            <Faq q="自分のシナリオを登録したい。">
              <Link href="/scenarios/new" className="underline">
                シナリオを登録する
              </Link>
              から、頒布ページのURLを貼り付けるだけで基本情報を自動取得できます。タイトル・価格・頒布元以外の項目は空欄のままでも登録可能です。
            </Faq>
            <Faq q="登録した内容を後から直したい。">
              シナリオ詳細ページの「情報を編集」から直せます。ログインしていれば、登録した本人でなくても修正できます（誤りの修正や情報の追記を想定した仕様です）。マイページの「登録したシナリオ」からも同じ編集画面に移動できます。
            </Faq>
            <Faq q="自分の作品を掲載してほしくない。">
              無料公開作品であれば、
              <Link href="/excluded-authors" className="underline">
                掲載不可作者一覧
              </Link>
              のページから掲載停止を申請できます。有償頒布作品はレビューが購入判断の材料になるため、原則として対象外としていますが、著作権侵害など特別な事情がある場合はお問い合わせください。
            </Faq>
          </Section>

          <Section id="moderation" title="通報・要素タグについて">
            <Faq q="不適切なレビューを見つけました。">
              各レビューの右下にある「通報する」から報告できます。運営が内容を確認したうえで、必要に応じて非表示にします。
            </Faq>
            <Faq q="「プレイ前に知っておきたい要素」とは何ですか？">
              性描写や暴力表現など、事前に知っておきたい要素をレビュアーが申告する項目です。ネタバレを避けるため、具体的な展開ではなく要素の種類のみが集計・表示されます。
            </Faq>
            <Faq q="「引用・参考元について」の項目は何のためにありますか？">
              既存作品からの影響を感じたかどうかを、レビュアーの回答として集計する項目です。特定のレビューや申告をもって「盗作である」と断定するものではなく、あくまで回答の分布を示すものです。
            </Faq>
          </Section>

          <Section id="account" title="アカウントについて">
            <Faq q="表示名やアイコンを変更したい。">
              <Link href="/mypage" className="underline">
                マイページ
              </Link>
              の名前の右にある「変更する」から表示名を、「アイコンを変更」からアイコン・カラーを選べます。
            </Faq>
            <Faq q="アカウントを削除したい。">
              マイページの「アカウント設定」から削除できます。投稿したレビューやシナリオ情報も削除されますので、あらかじめご了承ください。
            </Faq>
          </Section>

          <Section id="contact" title="お問い合わせ">
            <div className="rounded-lg border border-line bg-panel p-5">
              <p className="mb-3.5 text-xs leading-relaxed text-ink-sub">
                ここに載っていないご質問や、不具合のご報告などがありましたら、お気軽にご連絡ください。
              </p>
              <Link
                href="/contact"
                className="inline-block rounded-md bg-accent px-5 py-2.5 text-[13px] text-white hover:bg-accent-hover"
              >
                お問い合わせする
              </Link>
            </div>
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
      className={`scroll-mt-24 ${first ? "" : "mt-9 border-t border-line pt-9"}`}
    >
      <h2 className="mb-3 text-[15px] font-bold">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex gap-2 text-[13.5px] font-bold text-ink">
        <span className="flex-shrink-0 text-accent">Q.</span>
        {q}
      </div>
      <div className="pl-[22px] text-[13px] leading-relaxed text-ink-sub">{children}</div>
    </div>
  );
}
