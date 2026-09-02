/**
 * Cold-case narratives are written once and then sit in the database while the
 * bill they describe keeps gathering dust. A day count baked in at write time
 * is wrong the next morning — the featured narrative claimed "438 days" beside
 * a badge reading 511.
 *
 * New narratives are asked for a {{days}} placeholder. Narratives written
 * before that also get their literal counts swapped, so old rows self-correct
 * without needing to be regenerated.
 */

// A bare number immediately before "days" — the only numeric shape these
// narratives use for dormancy. Plural only: a bill needs 180+ days of silence
// to qualify, so a singular "1 day" is never the dormancy count, and rewriting
// it would leave broken grammar behind.
const LITERAL_DAY_COUNT = /\b\d[\d,]*(?=\s+days\b)/g;

export function freshenNarrative(narrative: string, days: number): string {
  const live = days.toLocaleString();
  return narrative.split("{{days}}").join(live).replace(LITERAL_DAY_COUNT, live);
}
