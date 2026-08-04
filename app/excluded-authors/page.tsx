import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// TODO: /mnt/user-data/outputs/excluded_authors.html のデザインをここに移植する。
// デザイントークン(色・余白・タイポグラフィ)はglobals.cssに定義済みなので、
// Tailwindのユーティリティクラス(bg-panel, text-ink-sub 等)でそのまま再現できる。


export default function Page() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="mb-2 text-xl font-bold">掲載不可作者一覧</h1>
        <p className="text-sm text-ink-faint">
          未実装（excluded_authors.html を移植してください）
        </p>
      </main>
      <Footer />
    </>
  );
}
