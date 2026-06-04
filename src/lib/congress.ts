const BASE_URL = process.env.CONGRESS_API_BASE ?? "https://api.congress.gov/v3";
const API_KEY = process.env.CONGRESS_API_KEY ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BillSummary {
  congress: number;
  type: string;       // HR, S, HJRES, SJRES, HCONRES, SCONRES, HRES, SRES
  number: string;
  title: string;
  originChamber: "House" | "Senate";
  originChamberCode: "H" | "S";
  introducedDate: string;        // YYYY-MM-DD
  latestAction: {
    actionDate: string;
    text: string;
  };
  url: string;
}

export interface BillListResponse {
  bills: BillSummary[];
  pagination: {
    count: number;
    next?: string;
  };
  request: {
    billType?: string;
    congress?: string;
    contentType: string;
    format: string;
  };
}

export interface BillAction {
  actionDate: string;
  actionTime?: string;
  text: string;
  type: string;          // e.g. "IntroReferral", "Committee", "Floor", "BecameLaw"
  actionCode?: string;
  committees?: { name: string; systemCode: string; url: string }[];
  sourceSystem: { code: number; name: string };
}

export interface BillActionsResponse {
  actions: BillAction[];
  pagination: { count: number; next?: string };
}

export interface BillDetail {
  congress: number;
  type: string;
  number: string;
  title: string;
  introducedDate: string;
  originChamber: "House" | "Senate";
  latestAction: { actionDate: string; text: string };
  sponsors?: { bioguideId: string; fullName: string; party: string; state: string; url: string }[];
  cosponsors?: { count: number; url: string };
  committees?: { count: number; url: string };
  subjects?: { count: number; url: string };
  summaries?: { count: number; url: string };
  policyArea?: { name: string };
  constitutionalAuthorityStatementText?: string;
}

export interface BillDetailResponse {
  bill: BillDetail;
  request: { billNumber: string; billType: string; congress: string; contentType: string; format: string };
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function congressFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: { "X-Api-Key": API_KEY },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Congress API ${res.status} on ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ── API methods ───────────────────────────────────────────────────────────────

/** List bills for a given congress, sorted by most recently introduced. */
export async function listBills(
  congress: number,
  opts: { limit?: number; offset?: number; sort?: string; billType?: string } = {}
): Promise<BillListResponse> {
  const { limit = 20, offset = 0, sort = "updateDate+desc", billType } = opts;
  const path = billType
    ? `/bill/${congress}/${billType.toLowerCase()}`
    : `/bill/${congress}`;
  return congressFetch<BillListResponse>(path, { limit, offset, sort });
}

/** Full detail for a single bill. */
export async function getBill(congress: number, billType: string, billNumber: string): Promise<BillDetailResponse> {
  return congressFetch<BillDetailResponse>(`/bill/${congress}/${billType.toLowerCase()}/${billNumber}`);
}

/** All legislative actions for a bill. */
export async function getBillActions(
  congress: number,
  billType: string,
  billNumber: string,
  limit = 250
): Promise<BillActionsResponse> {
  return congressFetch<BillActionsResponse>(
    `/bill/${congress}/${billType.toLowerCase()}/${billNumber}/actions`,
    { limit }
  );
}

// ── Domain logic: "killed" bill detection ─────────────────────────────────────

/**
 * A bill is a candidate for "killed in committee" if:
 *  - Its only actions are introduction + committee referral
 *  - No Floor, Committee markup, or vote actions appear
 *  - Last action is older than 180 days
 */
export function isLikelyAbandoned(bill: BillSummary, actions?: BillAction[]): boolean {
  const lastActionDate = new Date(bill.latestAction.actionDate);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 180);
  if (lastActionDate > cutoff) return false;

  // If we have full action list, be more precise
  if (actions) {
    const hasFloorAction = actions.some((a) =>
      ["Floor", "BecameLaw", "Discharge", "ReportedToSenate", "ReportedToHouse"].includes(a.type) ||
      a.actionCode === "H11100" // committee report
    );
    return !hasFloorAction;
  }

  // Fallback: check latestAction text for committee referral only
  const text = bill.latestAction.text.toLowerCase();
  return text.includes("referred to") || text.includes("committee on");
}
