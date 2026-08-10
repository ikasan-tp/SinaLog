import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sinalog.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("id, created_at")
    .eq("is_hidden", false);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/help`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${BASE_URL}/excluded-authors`, changeFrequency: "monthly", priority: 0.2 },
  ];

  const scenarioRoutes: MetadataRoute.Sitemap = (scenarios ?? []).map((s) => ({
    url: `${BASE_URL}/scenarios/${s.id}`,
    lastModified: s.created_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...scenarioRoutes];
}
