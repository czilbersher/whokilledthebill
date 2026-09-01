/**
 * Full-coverage ingest — all bill types, all of the 119th Congress.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest-bills.mjs
 *
 * Resumable: bills fetched within SKIP_DAYS are skipped so re-runs are cheap.
 * Rate-safe: retries with exponential backoff on HTTP 429.
 */

import { createClient } from "@supabase/supabase-js";

const CONGRESS_BASE = process.env.CONGRESS_API_BASE ?? "https://api.congress.gov/v3";
const CONGRESS_KEY  = process.env.CONGRESS_API_KEY;
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Writes need the service role key — RLS on `bills` rejects upserts made with
// the anon key. Falls back to anon so a read-only local run still works.
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const CONGRESS       = 119;
const BILL_TYPES     = ["hr", "s", "hjres", "sjres", "hres", "sres", "hconres", "sconres"];
const PAGE_SIZE      = 250;   // Congress.gov max per page
const CONCURRENCY    = 8;     // parallel detail fetches
const SKIP_DAYS      = 7;     // skip bills already ingested this week
const MIN_ABANDONED  = 180;   // days since last action to be considered abandoned
const UPSERT_BATCH   = 50;    // rows per Supabase upsert call
const LIST_PAUSE_MS  = 80;    // pause between list pages (gentle pacing)

if (!CONGRESS_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  Missing env vars — need CONGRESS_API_KEY, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Congress.gov fetch with exponential backoff on 429 ────────────────────────

async function congressGet(path, params = {}) {
  const url = new URL(`${CONGRESS_BASE}${path}`);
  url.searchParams.set("api_key", CONGRESS_KEY);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  let delay = 2000;
  for (;;) {
    const res = await fetch(url.toString());
    if (res.status === 429) {
      process.stdout.write(`\n  ⚠  Rate limited — backing off ${delay / 1000}s `);
      await sleep(delay);
      delay = Math.min(delay * 2, 60_000);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function billId(type, number) {
  return `${CONGRESS}-${type.toLowerCase()}-${number}`;
}

function constructLegislationUrl(type, number) {
  const slug = {
    hr: "house-bill", s: "senate-bill",
    hjres: "house-joint-resolution", sjres: "senate-joint-resolution",
    hres: "house-resolution",        sres: "senate-resolution",
    hconres: "house-concurrent-resolution", sconres: "senate-concurrent-resolution",
  }[type] ?? type;
  return `https://www.congress.gov/bill/119th-congress/${slug}/${number}`;
}

function isAbandonedCandidate(bill) {
  const days = daysSince(bill.latestAction?.actionDate);
  if (!days || days < MIN_ABANDONED) return false;
  const text = (bill.latestAction?.text ?? "").toLowerCase();
  return text.includes("referred to") || text.includes("committee");
}

// ── Scan all pages for one bill type, return abandoned candidates ─────────────

async function scanBillType(billType) {
  const candidates = [];
  let offset = 0;
  let totalScanned = 0;

  process.stdout.write(`  ${billType.toUpperCase().padEnd(8)} scanning `);

  for (;;) {
    const data = await congressGet(`/bill/${CONGRESS}/${billType}`, {
      limit: PAGE_SIZE,
      offset,
      sort: "updateDate+asc",  // oldest-updated first = most neglected at top
    });

    const bills = data.bills ?? [];
    if (bills.length === 0) break;

    totalScanned += bills.length;
    for (const bill of bills) {
      if (isAbandonedCandidate(bill)) candidates.push(bill);
    }

    process.stdout.write(".");
    offset += bills.length;
    if (bills.length < PAGE_SIZE) break;
    await sleep(LIST_PAUSE_MS);
  }

  console.log(` ${totalScanned.toLocaleString()} scanned → ${candidates.length} candidates`);
  return candidates;
}

// ── Fetch full detail for one bill ────────────────────────────────────────────

async function fetchDetail(bill) {
  const type   = bill.type.toLowerCase();
  const number = String(bill.number);
  try {
    const { bill: d } = await congressGet(`/bill/${CONGRESS}/${type}/${number}`);
    const sponsor = d.sponsors?.[0] ?? null;
    return {
      id:                  billId(type, number),
      congress:            CONGRESS,
      bill_type:           type,
      number,
      title:               d.title ?? bill.title ?? "Untitled",
      introduced_date:     d.introducedDate ?? null,
      latest_action_date:  d.latestAction?.actionDate ?? bill.latestAction?.actionDate ?? null,
      latest_action_text:  d.latestAction?.text       ?? bill.latestAction?.text       ?? null,
      origin_chamber:      d.originChamber  ?? bill.originChamber  ?? null,
      policy_area:         d.policyArea?.name ?? null,
      legislation_url:     d.legislationUrl ?? constructLegislationUrl(type, number),
      action_count:        d.actions?.count ?? 0,
      is_abandoned:        true,
      sponsor_name:        sponsor?.fullName   ?? null,
      sponsor_party:       sponsor?.party      ?? null,
      sponsor_state:       sponsor?.state      ?? null,
      sponsor_district:    sponsor?.district   ?? null,
      sponsor_bioguide_id: sponsor?.bioguideId ?? null,
      fetched_at:          new Date().toISOString(),
    };
  } catch (err) {
    process.stdout.write(`\n  ⚠  ${bill.type} ${bill.number}: ${err.message}\n`);
    return null;
  }
}

// ── Fetch details in parallel chunks ─────────────────────────────────────────

async function fetchDetailsBatch(candidates) {
  // Deduplicate by bill ID — offset pagination can surface the same bill twice
  // if its updateDate changes between pages while we're scanning.
  const seen = new Set();
  const unique = candidates.filter((b) => {
    const id = billId(b.type.toLowerCase(), b.number);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const rows = [];
  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const chunk = unique.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(chunk.map(fetchDetail));
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) rows.push(r.value);
    }
    const done = Math.min(i + CONCURRENCY, unique.length);
    process.stdout.write(`\r    details ${done}/${unique.length}   `);
  }
  process.stdout.write("\n");
  return rows;
}

// ── Upsert rows to Supabase in batches ───────────────────────────────────────

async function upsertRows(rows) {
  // Final dedup guard — ensures no two rows share an id within a batch
  const seen = new Set();
  const unique = rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  let stored = 0;
  for (let i = 0; i < unique.length; i += UPSERT_BATCH) {
    const batch = unique.slice(i, i + UPSERT_BATCH);
    const { error } = await supabase.from("bills").upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`Upsert error: ${error.message}`);
    stored += batch.length;
    process.stdout.write(`\r    upserted ${stored}/${unique.length}   `);
  }
  process.stdout.write("\n");
  return stored;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const t0 = Date.now();
console.log(`\n📜  Full ingest — 119th Congress (all bill types)\n`);
console.log(`    Bill types : ${BILL_TYPES.join(", ")}`);
console.log(`    Abandoned  : last action ≥ ${MIN_ABANDONED} days ago + referred to committee`);
console.log(`    Resumable  : skipping bills fetched within the last ${SKIP_DAYS} days\n`);

// Pre-load IDs already in Supabase so we can skip them
const { data: existingRows } = await supabase.from("bills").select("id, fetched_at");
const skipIds = new Set(
  (existingRows ?? [])
    .filter((b) => (daysSince(b.fetched_at) ?? 999) < SKIP_DAYS)
    .map((b) => b.id)
);
console.log(`  Skipping ${skipIds.size} bills already in DB (fetched < ${SKIP_DAYS}d ago)\n`);

let grandTotal    = 0;
let grandSkipped  = 0;
const typeResults = [];

for (const billType of BILL_TYPES) {
  const candidates = await scanBillType(billType);

  const fresh = candidates.filter((b) => !skipIds.has(billId(billType, b.number)));
  const skipped = candidates.length - fresh.length;
  grandSkipped += skipped;

  if (fresh.length === 0) {
    if (skipped > 0) console.log(`    → all ${skipped} already in DB, skipping\n`);
    else             console.log(`    → none found, skipping\n`);
    typeResults.push({ type: billType, stored: 0, skipped });
    continue;
  }

  if (skipped > 0) console.log(`    (${skipped} already in DB, fetching ${fresh.length} new)`);

  const rows    = await fetchDetailsBatch(fresh);
  const stored  = await upsertRows(rows);
  grandTotal   += stored;

  typeResults.push({ type: billType, stored, skipped });
  console.log(`    ✅  ${stored} ${billType.toUpperCase()} bills stored\n`);
}

const elapsed = Math.round((Date.now() - t0) / 1000);
const mins    = Math.floor(elapsed / 60);
const secs    = elapsed % 60;

console.log("─".repeat(60));
console.log(`✅  Ingest complete in ${mins}m ${secs}s\n`);
console.log("  Bill type  │  Stored  │  Skipped");
console.log("  ─────────────────────────────────");
for (const r of typeResults) {
  console.log(`  ${r.type.toUpperCase().padEnd(9)}  │  ${String(r.stored).padStart(6)}  │  ${String(r.skipped).padStart(7)}`);
}

const { count } = await supabase
  .from("bills")
  .select("*", { count: "exact", head: true })
  .eq("is_abandoned", true);

console.log(`\n  Total abandoned bills in database: ${count?.toLocaleString()}`);
console.log(`  Run again any time — already-ingested bills are skipped.\n`);
