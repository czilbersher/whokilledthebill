import { ImageResponse } from "next/og";
import { createServerSupabaseClient } from "@/lib/supabase";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function daysSince(d: string | null) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const parts = slug.split("-");
  const number = parts[parts.length - 1];
  const billType = parts.slice(0, parts.length - 1).join("").toUpperCase();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/bills?bill_type=eq.${billType.toLowerCase()}&number=eq.${number}&select=*&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  const bills = await res.json();
  const bill = bills[0];

  if (!bill) {
    return new ImageResponse(
      (
        <div style={{ width: 1200, height: 630, background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 48, color: "#e6edf3" }}>Bill not found</div>
        </div>
      ),
      { ...size }
    );
  }

  const days = daysSince(bill.latest_action_date);
  const sponsorName = (bill.sponsor_name ?? "Unknown").replace(/\s*\[.*?\]\s*/g, "").trim();
  const partyKey = bill.sponsor_party ?? "I";
  const partyColor = partyKey === "R" ? "#dc2626" : partyKey === "D" ? "#2563eb" : "#6b7280";
  const partyLabel = partyKey === "R" ? "Republican" : partyKey === "D" ? "Democrat" : "Independent";
  const title = bill.title?.length > 120 ? bill.title.slice(0, 117) + "..." : bill.title;

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
          borderTop: `16px solid #dc2626`,
        }}
      >
        {/* Top: site name */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: 18, color: "#8b9198", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>
            WHO KILLED THE BILL?
          </div>
        </div>

        {/* Middle: bill info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ background: partyColor, color: "#ffffff", fontSize: 16, fontWeight: 700, padding: "6px 16px", borderRadius: "6px" }}>
              {partyLabel}
            </div>
            <div style={{ fontSize: 18, color: "#8b9198", fontWeight: 600 }}>
              {billType} {number}
            </div>
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#e6edf3", lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ fontSize: 20, color: "#8b9198" }}>
            Sponsored by {sponsorName}
          </div>
        </div>

        {/* Bottom: stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: "#f5c518", lineHeight: 1 }}>
              {days.toLocaleString()}
            </div>
            <div style={{ fontSize: 20, color: "#8b9198", fontWeight: 600 }}>
              days ignored.{"\n"}No hearing. No vote. No explanation.
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#30363d" }}>
            whokilledthebill.com
          </div>
        </div>

      </div>
    ),
    { ...size }
  );
}