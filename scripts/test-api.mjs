/**
 * Standalone API smoke test — run with:
 *   node --env-file=.env.local scripts/test-api.mjs
 *
 * Tests the Congress.gov API and surfaces bills from the 119th Congress
 * that appear stuck in committee (introduced but no further action).
 */

const BASE_URL = process.env.CONGRESS_API_BASE ?? "https://api.data.gov/congress/v3";
const API_KEY = process.env.CONGRESS_API_KEY;

if (!API_KEY) {
  console.error("❌  CONGRESS_API_KEY not set — make sure .env.local exists");
  process.exit(1);
}

async function congressFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} — ${path}\n${body}`);
  }
  return res.json();
}

function isLikelyAbandoned(bill) {
  const lastAction = new Date(bill.latestAction?.actionDate ?? "2000-01-01");
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 180);
  if (lastAction > cutoff) return false;

  const text = (bill.latestAction?.text ?? "").toLowerCase();
  return text.includes("referred to") || text.includes("committee");
}

// ── 1. Health check ───────────────────────────────────────────────────────────
console.log("\n═══ 1. API Health Check ════════════════════════════════════════════\n");
const health = await congressFetch("/bill/119", { limit: 1 });
console.log("✅  Connected to Congress.gov API");
console.log(`    Total bills indexed for 119th Congress: ${health.pagination?.count?.toLocaleString() ?? "unknown"}`);
console.log(`    API request object:`, JSON.stringify(health.request, null, 4));

// ── 2. Sample recent bills (raw) ──────────────────────────────────────────────
console.log("\n═══ 2. 5 Most Recently Updated Bills (Raw Response) ════════════════\n");
const recent = await congressFetch("/bill/119", { limit: 5, sort: "updateDate+desc" });
console.log(JSON.stringify(recent.bills, null, 2));

// ── 3. Introduced-only bills (likely stuck) ───────────────────────────────────
console.log("\n═══ 3. Recently Introduced House Bills — Filtering for Committee Limbo ═\n");
const introduced = await congressFetch("/bill/119/hr", {
  limit: 50,
  sort: "updateDate+asc",   // oldest updates first → most neglected
});

const abandoned = introduced.bills.filter(isLikelyAbandoned);
console.log(`Fetched ${introduced.bills.length} bills — ${abandoned.length} appear stuck in committee:\n`);

for (const bill of abandoned.slice(0, 10)) {
  console.log(`  HR ${bill.number.padEnd(6)} | Introduced: ${bill.introducedDate} | Last action: ${bill.latestAction?.actionDate}`);
  console.log(`           Title: ${bill.title?.slice(0, 90)}`);
  console.log(`           Action: ${bill.latestAction?.text?.slice(0, 100)}`);
  console.log();
}

// ── 4. Drill into one bill's full action history ──────────────────────────────
if (abandoned.length > 0) {
  const sample = abandoned[0];
  console.log(`\n═══ 4. Full Action History — HR ${sample.number} ══════════════════════\n`);
  const actions = await congressFetch(
    `/bill/119/hr/${sample.number}/actions`,
    { limit: 20 }
  );
  console.log(`Bill: ${sample.title}`);
  console.log(`Actions (${actions.pagination?.count ?? 0} total):\n`);
  for (const a of (actions.actions ?? [])) {
    console.log(`  ${a.actionDate}  [${a.type ?? "—"}]  ${a.text}`);
  }

  // Raw bill detail
  console.log(`\n═══ 5. Raw Bill Detail Object ══════════════════════════════════════\n`);
  const detail = await congressFetch(`/bill/119/hr/${sample.number}`);
  console.log(JSON.stringify(detail.bill, null, 2));
}

console.log("\n✅  All tests passed.\n");
