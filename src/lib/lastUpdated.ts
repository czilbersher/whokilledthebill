import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * When the bill data was last pulled from Congress.gov, as a display string.
 *
 * The nightly ingest stamps every row it touches with `fetched_at`, so the
 * newest stamp is the freshness of the site. This used to be a hardcoded date
 * that went stale the moment the ingest stopped being run by hand.
 */
export async function lastUpdatedLabel(supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase
    .from("bills")
    .select("fetched_at")
    .not("fetched_at", "is", null)
    .order("fetched_at", { ascending: false })
    .limit(1);

  const stamp = (data?.[0] as { fetched_at: string } | undefined)?.fetched_at;
  if (!stamp) return "recently";

  return new Date(stamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}
