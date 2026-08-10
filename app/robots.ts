import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sinalog.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // ログイン・マイページ・管理画面は検索結果に載せない
      disallow: ["/login", "/mypage", "/admin", "/auth"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
