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

type Props = { params: Promise<{ bioguide_id: string }> };

export default async function RepPage({ params }: Props) {
  const { bioguide_id } = await params;
  const supabase = createServerSupabaseClient();

  const { data: bills } = await supabase
    .from("bills")
    .select("*")
    .eq("sponsor_bioguide_id", bioguide_id)
    .eq("is_abandoned", true)
    .order("latest_action_date", { ascending: true })
    .limit(10000);

  if (!bills || bills.length === 0) return notFound();

  const rep = bills[0] as BillRow;
  const rawName = rep.sponsor_name ?? "Unknown Sponsor";
  const sponsorName = rawName.replace(/\s*\[.*?\]\s*/g, "").trim();
  const partyKey = rep.sponsor_party ?? "I";
  const partyLabel = PARTY_LABELS[partyKey] ?? partyKey;
  const borderColor = PARTY_BORDER[partyKey] ?? "#6b7280";
  const partyTextColor = PARTY_TEXT[partyKey] ?? "#6b7280";
  const district = rep.sponsor_district ? `-${rep.sponsor_district}` : "";
  const location = rep.sponsor_state ? `${rep.sponsor_state}${district}` : "";
  const chamber = rep.origin_chamber === "Senate" ? "Senator" : "Representative";

  const policyCounts: Record<string, number> = {};
  for (const b of bills as BillRow[]) {
    const p = b.policy_area ?? "Uncategorized";
    policyCounts[p] = (policyCounts[p] ?? 0) + 1;
  }
  const topPolicies = Object.entries(policyCounts)
    .sort((a, b) => b[1] - a[1]);

  const avgDays = Math.round(
    (bills as BillRow[]).reduce((sum, b) => sum + daysSince(b.latest_action_date), 0) / bills.length
  );

  const photoUrl = `https://bioguide.congress.gov/bioguide/photo/${bioguide_id[0]}/${bioguide_id}.jpg`;
  const tweetText = encodeURIComponent(`${sponsorName} introduced ${bills.length} bills in the 119th Congress. Every single one died in committee. No hearing. No vote. No explanation.\n\nwhokilledthebill.com/rep/${bioguide_id}`);

  function ShareButton() {
    return (
      
        href={`https://twitter.com/intent/tweet?text=${tweetText}`}
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "#000", color: "#fff", fontSize: "13px", fontWeight: 600, borderRadius: "6px", textDecoration: "none", border: "0.5px solid #30363d" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f8f6", minHeight: "100vh" }}>

      {/* Top nav bar */}
      <div style={{ backgroundColor: "#0d1117", borderBottom: "1px solid #30363d" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ color: "#e6edf3", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            ← Back to all bills
          </Link>
          <ShareButton />
        </div>
      </div>

      {/* Option C Header */}
      <div style={{ backgroundColor: "#161b22", borderBottom: `4px solid ${borderColor}` }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap" }}>
            <img
              src={photoUrl}
              alt={sponsorName}
              width={100}
              height={120}
              style={{ borderRadius: "4px", objectFit: "cover", flexShrink: 0, border: "1px solid #30363d" }}
            />
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

      {/* Abandonment banner */}
      <div style={{ maxWidth: "64rem", margin: "1.5rem auto 0", padding: "0 1.5rem" }}>
        <div style={{ backgroundColor: "#F9F3EE", border: "1px solid #DDC9B4", borderRadius: "6px", padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#dc2626", margin: 0 }}>100% abandonment rate</p>
          <p style={{ fontSize: "14px", color: "#92400e", marginTop: "4px", marginBottom: 0 }}>Every bill this member introduced in the 119th Congress died in committee with no hearing, no vote, and no explanation.</p>
        </div>
      </div>

      {/* Interactive bill list */}
      <RepBillList bills={bills as BillRow[]} topPolicies={topPolicies} />

    </div>
  );
}