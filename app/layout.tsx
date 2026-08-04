import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "シナログ┃TRPGシナリオレビュー",
  description:
    "クトゥルフ神話TRPGシナリオのレビューサイト「シナログ」。プレイ前に知っておきたい要素や、おすすめ度をレビュアーの回答から確認できます。",
};

// ページ描画前にlocalStorageのテーマを読み、<html>に反映する。
// これをheadで同期実行しておかないと、読み込み直後に既定テーマ→
// 保存済みテーマへ一瞬切り替わる「ちらつき」が発生する。
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = JSON.parse(localStorage.getItem('sinalog-theme') || '{}');
    var mode = saved.mode === 'dark' ? 'dark' : 'light';
    var accent = saved.accent || 'wine';
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-accent', accent);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="light" data-accent="wine" className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${notoSansJP.variable} min-h-full flex flex-col bg-bg text-ink font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
