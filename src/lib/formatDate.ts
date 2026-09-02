/**
 * Formats the date-only columns that come out of Supabase (`introduced_date`,
 * `latest_action_date`, `featured_week`) — plain strings like "2025-04-09".
 *
 * `new Date("2025-04-09")` is parsed as UTC midnight, and toLocaleDateString
 * then renders it in the local zone. Every US timezone is behind UTC, so that
 * lands on the previous day: the site printed "April 8, 2025" for a bill the
 * Library of Congress records as introduced on April 9. On a site whose claim
 * is that the record says what we say it says, an off-by-one date is not
 * cosmetic — so pin these to UTC, where the source data already lives.
 *
 * Real timestamps (`fetched_at`) are a different case and belong in
 * lastUpdated.ts, which formats in the site's own timezone on purpose.
 */

const DEFAULT_OPTS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

export function formatDate(
  dateStr: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = DEFAULT_OPTS
): string {
  if (!dateStr) return "Unknown";

  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return "Unknown";

  return parsed.toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}
