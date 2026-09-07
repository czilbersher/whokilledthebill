import { unstable_cache } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { BillRow } from "@/types/db";

/**
 * Cached reads for the two high-volume routes.
 *
 * There are ~9,800 bill pages and 537 rep pages. Google began crawling all of
 * them on 2026-09-01 and each hit re-ran these queries, which is what drove
 * Vercel usage up.
 *
 * Two earlier attempts to fix that did not work, and it is worth recording why
 * so nobody repeats them:
 *
 *   1. `export const revalidate` alone. Inert. Per node_modules/next/dist/docs
 *      ("Caching and Revalidating"), fetch is not cached by default in Next 16,
 *      and supabase-js issues its queries through fetch. revalidate sets how
 *      often to regenerate a cached route; it cannot cache uncacheable data.
 *   2. Adding `fetchCache = "force-cache"`. Production still returned
 *      "Cache-Control: no-store" and X-Vercel-Cache: MISS on three consecutive
 *      requests, so supabase-js is evidently not going through the fetch that
 *      Next instruments.
 *
 * unstable_cache is the documented answer for exactly this case — "database
 * queries and other async functions that don't use fetch". It caches the result
 * itself rather than trying to reach the network call underneath, so it does
 * not depend on how supabase-js is wired internally. That is the reason to
 * expect it to work where the other two did not.
 *
 * It is deprecated in favour of the `use cache` directive, which needs the
 * cacheComponents flag turned on for the whole site. Not worth that risk here
 * for a site being kept deliberately low-maintenance.
 */

const DAY = 86_400;

export const getBillBySlugParts = unstable_cache(
  async (billType: string, number: string): Promise<BillRow | null> => {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from("bills")
      .select("*")
      .eq("bill_type", billType)
      .eq("number", number)
      .limit(1);
    return (data?.[0] as BillRow | undefined) ?? null;
  },
  ["bill-by-slug"],
  { revalidate: DAY, tags: ["bills"] }
);

export const getRepBills = unstable_cache(
  async (bioguideId: string): Promise<{ bills: BillRow[]; totalCount: number }> => {
    const supabase = createServerSupabaseClient();
    const [{ data }, { count }] = await Promise.all([
      supabase
        .from("bills")
        .select("*")
        .eq("sponsor_bioguide_id", bioguideId)
        .eq("is_abandoned", true)
        .order("latest_action_date", { ascending: true })
        .limit(10000),
      supabase
        .from("bills")
        .select("*", { count: "exact", head: true })
        .eq("sponsor_bioguide_id", bioguideId),
    ]);
    return { bills: (data ?? []) as BillRow[], totalCount: count ?? 0 };
  },
  ["rep-bills"],
  { revalidate: DAY, tags: ["bills"] }
);
