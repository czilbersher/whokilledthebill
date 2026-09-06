import { createServerSupabaseClient } from "@/lib/supabase";

const SITE = "https://www.whokilledthebill.com";

// Every request here pulls 10,000 rows to build ~10,342 URLs. Crawlers re-fetch
// sitemap.xml often, so cache it for a day rather than rebuilding per hit.
export const revalidate = 86400;

type SitemapRow = {
  bill_type: string | null;
  number: string | null;
  sponsor_bioguide_id: string | null;
  latest_action_date: string | null;
};

export default async function sitemap() {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("bills")
    .select("bill_type, number, sponsor_bioguide_id, latest_action_date")
    .eq("is_abandoned", true)
    .limit(10000);

  const rows = (data ?? []) as SitemapRow[];
  const now = new Date();

  // One page per abandoned bill — /bill/{type}-{number}, matching the [slug] route.
  const billPages = rows
    .filter((b) => b.bill_type && b.number)
    .map((b) => ({
      url: SITE + "/bill/" + b.bill_type + "-" + b.number,
      lastModified: b.latest_action_date ? new Date(b.latest_action_date) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const bioguideIds = [
    ...new Set(rows.map((b) => b.sponsor_bioguide_id).filter(Boolean)),
  ] as string[];

  const repPages = bioguideIds.map((id) => ({
    url: SITE + "/rep/" + id,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: SITE, lastModified: now, changeFrequency: "daily" as const, priority: 1.0 },
    { url: SITE + "/leaderboard", lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: SITE + "/cold-case", lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: SITE + "/faq", lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: SITE + "/methodology", lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: SITE + "/about", lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    ...repPages,
    ...billPages,
  ];
}
