import { createServerSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { BillRow } from "@/types/db";
import RepBillList from "@/app/components/RepBillList";

function daysSince(d: string | null) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

const PARTY_LABELS: Record<string, string> = {
  R: "Republican", D: "Democrat", I: "Independent",
};

const PARTY_BORDER: Record<string, string> = {
  R: "#dc2626", D: "#1a3a6b", I: "#6b7280",
};

const PARTY_TEXT: Record<string, string> = {
  R: "#dc2626", D: "#3b82f6", I: "#6b7280",
};

function getGrade(abandonedCount: number, totalCount: number) {
  if (totalCount === 0) return { grade: "N/A", color: "#6b7280", verdict: "No bills introduced" };
  const pct = (totalCount - abandonedCount) / totalCount;
  if (pct === 0) return { grade: "F", color: "#dc2626", verdict: "Failed to advance a single bill" };
  if (pct <= 0.10) return { grade: "D", color: "#f97316", verdict: "Advanced fewer than 1 in 10 bills" };
  if (pct <= 0.25) return { grade: "C", color: "#eab308", verdict: "Advanced fewer than 1 in 4 bills" };
  if (pct <= 0.50) return { grade: "B", color: "#22c55e", verdict: "Advanced fewer than half of bills" };
  return { grade: "A", color: "#16a34a", verdict: "Advanced more than half of bills" };
}

type Props = { params: Promise<{ bioguide_id: string }> };

export default async function RepPage({ params }: Props) {
  const { bioguide_id } = await params;
  const supabase = createServerSupabaseClient();

  const [{ data: abandonedBills }, { count: totalCount }] = await Promise.all([
    supabase
      .from("bills")
      .select("*")
      .eq("sponsor_bioguide_id", bioguide_id)
      .eq("is_abandoned", true)
      .order("latest_action_date", { ascending: true })
      .limit(10000),
    supabase
      .from("bills")
      .select("*", { count: "exact", head: true })
      .eq("sponsor_bioguide_id", bioguide_id),
  ]);

  if (!abandonedBills || abandonedBills.length === 0) return notFound();

  const bills = abandonedBills;
  const rep = bills[0] as BillRow;
  const rawName = rep.sponsor_name ?? "Unknown Sponsor";
  const sponsorName = rawName.replace(/\s*\[.*?\]\s*/g, "").trim();
  const partyKey = rep.sponsor_party ?? "I";
  const partyLabel = PARTY_LABELS[partyKey] ?? partyKey;
  const borderColor = PARTY_BORDER[partyKey] ?? "#6b7280";
  const partyTextColor = PARTY_TEXT[partyKey] ?? "#6b7280";
  const district = rep.sponsor_district ? "-" + rep.sponsor_district : "";
  const location = rep.sponsor_state ? rep.sponsor_state + district : "";
  const chamber = rep.origin_chamber === "Senate" ? "Senator" : "Representative";

  const policyCounts: Record<string, number> = {};
  for (const b of bills as BillRow[]) {
    const p = b.policy_area ?? "Uncategorized";
    policyCounts[p] = (policyCounts[p] ?? 0) + 1;
  }
  const topPolicies = Object.entries(policyCounts).sort((a, b) => b[1] - a[1]);

  const avgDays = Math.round(
    (bills as BillRow[]).reduce((sum, b) => sum + daysSince(b.latest_action_date), 0) / bills.length
  );

  const total = totalCount ?? bills.length;
  const reportCard = getGrade(bills.length, total);
  const abandonmentPct = Math.round((bills.length / total) * 100);
  const receivedAction = total - bills.length;

  const shareText = sponsorName + " introduced " + String(total) + " bills in the 119th Congress. " + String(bills.length) + " died with no hearing and no vote. Legislative Report Card grade: " + reportCard.grade + ". whokilledthebill.com/rep/" + bioguide_id;
  const tweetHref = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText);
  const photoUrl = "https://bioguide.congress.gov/bioguide/photo/" + bioguide_id[0] + "/" + bioguide_id + ".jpg";

  return (
    <div style={{ backgroundColor: "#f8f8f6", minHeight: "100vh" }}>

      <div style={{ backgroundColor: "#0d1117", borderBottom: "1px solid #30363d" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ color: "#e6edf3", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Back to all bills
          </Link>
          <a href={tweetHref} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "#000", color: "#fff", fontSize: "13px", fontWeight: 600, borderRadius: "6px", textDecoration: "none", border: "0.5px solid #30363d" }}>
            Share on X
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: "#161b22", borderBottom: "4px solid " + borderColor }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap" }}>
            <img src={photoUrl} alt={sponsorName} width={100} height={120} style={{ borderRadius: "4px", objectFit: "cover", flexShrink: 0, border: "1px solid #30363d" }} />
            <div style={{ flex: 1, borderLeft: "0.5px solid #30363d", paddingLeft: "2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Name</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#e6edf3" }}>{sponsorName}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Party</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: partyTextColor }}>{partyLabel}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Chamber</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#e6edf3" }}>{chamber}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>State</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#e6edf3" }}>{location}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Bills abandoned</div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#dc2626" }}>{bills.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg days ignored</div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#f5c518" }}>{avgDays.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "64rem", margin: "1.5rem auto 0", padding: "0 1.5rem" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", minWidth: "80px" }}>
            <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>119th Congress</div>
            <div style={{ fontSize: "72px", fontWeight: 900, lineHeight: 1, color: reportCard.color }}>{reportCard.grade}</div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Legislative Report Card</div>
          </div>
          <div style={{ borderLeft: "1px solid #e5e7eb", paddingLeft: "2rem", flex: 1 }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 0.75rem 0" }}>{reportCard.verdict}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Bills introduced</div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#111827" }}>{total}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Received action</div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#dc2626" }}>{receivedAction}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Abandonment rate</div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#dc2626" }}>{abandonmentPct}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "64rem", margin: "1rem auto 0", padding: "0 1.5rem" }}>
        <div style={{ backgroundColor: "#F9F3EE", border: "1px solid #DDC9B4", borderRadius: "6px", padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#dc2626", margin: 0 }}>100% abandonment rate</p>
          <p style={{ fontSize: "14px", color: "#92400e", marginTop: "4px", marginBottom: 0 }}>Every bill this member introduced in the 119th Congress died in committee with no hearing, no vote, and no explanation.</p>
        </div>
      </div>

      <RepBillList bills={bills as BillRow[]} topPolicies={topPolicies} />

    </div>
  );
}