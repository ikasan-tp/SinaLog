import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const excludedAuthors: { name: string; date: string }[] = [];

export default function Page() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[820px] flex-1 px-5 py-8 md:px-6">
        <div className="mb-4 text-xs text-ink-faint">
          <Link href="/" className="text-link hover:underline">トップ</Link>
          <span> ＞ 掲載不可作者一覧</span>
        </div>

        <h1 className="mb-2 text-[22px] font-bold">掲載不可作者一覧</h1>
        <p className="mb-7 text-[13px] leading-8 text-ink-sub">
          作者本人または権利者から掲載停止の申請があった場合、このページに掲載し、該当作者のシナリオ登録やレビュー表示の対象から除外します。
        </p>

        <section className="mb-8 rounded-lg border border-line bg-panel p-6">
          <h2 className="mb-2 text-sm font-bold">掲載停止を希望する作者・権利者の方へ</h2>
          <p className="mb-4 text-[12.5px] leading-7 text-ink-sub">
            ご本人確認ができる連絡先、対象となる作者名・サークル名、掲載停止を希望する範囲を添えてお問い合わせください。
          </p>
          <Link href="/help#contact" className="inline-block rounded-md bg-accent px-5 py-2.5 text-[13px] text-white hover:bg-accent-hover">
            申請方法を確認する
          </Link>
        </section>

        <section className="overflow-hidden rounded-lg border border-line bg-panel">
          <div className="grid grid-cols-[1fr_120px] border-b border-line px-5 py-3 text-[11px] text-ink-faint sm:grid-cols-[1fr_140px]">
            <span>作者名・サークル名</span>
            <span>掲載日</span>
          </div>
          {excludedAuthors.length > 0 ? (
            excludedAuthors.map((author) => (
              <div key={author.name} className="grid grid-cols-[1fr_120px] border-b border-line px-5 py-4 text-[13px] last:border-b-0 sm:grid-cols-[1fr_140px]">
                <span className="font-medium">{author.name}</span>
                <span className="text-xs text-ink-faint">{author.date}</span>
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-[13px] text-ink-sub">
              現在、掲載不可として登録されている作者・サークルはありません。
            </div>
          )}
        </section>

        <p className="mt-6 rounded-lg border border-line bg-panel p-4 text-[11.5px] leading-7 text-ink-faint">
          この一覧は、作者や権利者の意向を尊重するためのものです。第三者による代理申請の場合、確認に時間がかかることがあります。
        </p>
      </main>
      <Footer />
    </>
  );
}

