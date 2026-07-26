import { ImageResponse } from "next/og";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { BillRow } from "@/types/db";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function daysSince(d: string | null) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

const PARTY_LABELS: Record<string, string> = { R: "Republican", D: "Democrat", I: "Independent" };
const PARTY_COLOR: Record<string, string> = { R: "#dc2626", D: "#2563eb", I: "#6b7280" };

function getGrade(abandonedCount: number, totalCount: number) {
  if (totalCount === 0) return { grade: "N/A", color: "#6b7280" };
  const pct = (totalCount - abandonedCount) / totalCount;
  if (pct === 0) return { grade: "F", color: "#dc2626" };
  if (pct <= 0.10) return { grade: "D", color: "#f97316" };
  if (pct <= 0.25) return { grade: "C", color: "#eab308" };
  if (pct <= 0.50) return { grade: "B", color: "#22c55e" };
  return { grade: "A", color: "#16a34a" };
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ bioguide_id: string }>;
}) {
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

  if (!abandonedBills || abandonedBills.length === 0) {
    return new ImageResponse(
      (
        <div style={{ width: 1200, height: 630, background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 48, color: "#e6edf3", display: "flex" }}>Rep not found</div>
        </div>
      ),
      { ...size }
    );
  }

  const bills = abandonedBills as BillRow[];
  const rep = bills[0];
  const rawName = rep.sponsor_name ?? "Unknown Sponsor";
  const nameNoTitle = rawName.replace(/\s*\[.*?\]\s*/g, "").replace(/^(Rep\.|Sen\.|Del\.)\s*/i, "").trim();
  const nameParts = nameNoTitle.split(",");
  const sponsorName = nameParts.length === 2 ? nameParts[1].trim() + " " + nameParts[0].trim() : nameNoTitle;
  const partyKey = rep.sponsor_party ?? "I";
  const partyLabel = PARTY_LABELS[partyKey] ?? partyKey;
  const partyColor = PARTY_COLOR[partyKey] ?? "#6b7280";
  const district = rep.sponsor_district ? "-" + rep.sponsor_district : "";
  const location = rep.sponsor_state ? rep.sponsor_state + district : "";
  const chamber = rep.origin_chamber === "Senate" ? "Senator" : "Representative";

  const total = totalCount ?? bills.length;
  const grade = getGrade(bills.length, total);
  const avgDays = Math.round(
    bills.reduce((sum, b) => sum + daysSince(b.latest_action_date), 0) / bills.length
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0d1117",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          fontFamily: "sans-serif",
          borderTop: `16px solid ${partyColor}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 18, color: "#8b9198", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, display: "flex" }}>
            WHO KILLED THE BILL?
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ background: partyColor, color: "#ffffff", fontSize: 16, fontWeight: 700, padding: "6px 16px", borderRadius: "6px", display: "flex" }}>
              {partyLabel}
            </div>
            <div style={{ fontSize: 18, color: "#8b9198", fontWeight: 600, display: "flex" }}>
              {chamber}{location ? " • " + location : ""}
            </div>
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#e6edf3", lineHeight: 1.1, display: "flex" }}>
            {sponsorName}
          </div>
          <div style={{ fontSize: 20, color: "#8b9198", display: "flex" }}>
            {String(bills.length)} of {String(total)} bills abandoned. No hearing. No vote. No explanation.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: grade.color, lineHeight: 1, display: "flex" }}>
              {grade.grade}
            </div>
            <div style={{ fontSize: 20, color: "#8b9198", fontWeight: 600, display: "flex" }}>
              Legislative Report Card {"•"} Avg {avgDays.toLocaleString()} days ignored
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#30363d", display: "flex" }}>
            whokilledthebill.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
