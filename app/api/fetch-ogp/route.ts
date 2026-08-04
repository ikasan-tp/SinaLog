import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/**
 * 頒布ページ(BOOTH等)のURLを受け取り、OGPタグ(og:title / og:image / og:description)
 * を抽出して返すAPI。画像は保存せず、URLをそのまま返すだけ(ホットリンク運用)。
 *
 * POST /api/fetch-ogp  { url: string }
 */

const ALLOWED_HOSTS = [
  "booth.pm",
  // 必要に応じて他の頒布サイトのドメインをここに追加する
];

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URLを指定してください" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "URLの形式が正しくありません" }, { status: 400 });
  }

  const isAllowed = ALLOWED_HOSTS.some(
    (host) => target.hostname === host || target.hostname.endsWith(`.${host}`)
  );
  if (!isAllowed) {
    return NextResponse.json(
      { error: "対応していないサイトです。手動で入力してください。" },
      { status: 422 }
    );
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        // 一部サイトはUser-Agent無しのリクエストを弾くため付与しておく
        "User-Agent": "Mozilla/5.0 (compatible; SinalogBot/1.0)",
      },
      // サーバーレス関数のタイムアウト対策
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `取得に失敗しました（status: ${res.status}）` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr("content");
    const ogImage = $('meta[property="og:image"]').attr("content");
    const ogDescription = $('meta[property="og:description"]').attr("content");

    if (!ogTitle && !ogImage) {
      return NextResponse.json(
        { error: "このページからは情報を取得できませんでした。" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      title: ogTitle?.replace(/\s*-\s*BOOTH\s*$/, "").trim() ?? "",
      thumbnailUrl: ogImage ?? "",
      description: ogDescription ?? "",
    });
  } catch (err) {
    console.error("fetch-ogp error:", err);
    return NextResponse.json(
      { error: "一時的なエラーが発生しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }
}
