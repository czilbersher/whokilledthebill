import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ bioguide_id: string }>;
}) {
  const { bioguide_id } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/bills?sponsor_bioguide_id=eq.${bioguide_id}&is_abandoned=eq.true&select=sponsor_name,sponsor_party,sponsor_state,sponsor_district,origin_chamber`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  const bills = await res.json();
  const count = bills.length;
  const rep = bills[0] ?? {};

  const name = (rep.sponsor_name ?? "Unknown").replace(/^(Rep\.|Sen\.)\s/, "");
  const party = rep.sponsor_party ?? "I";
  const state = rep.sponsor_state ?? "";
  const district = rep.sponsor_district ? `-${rep.sponsor_district}` : "";
  const location = state ? `${state}${district}` : "";
  const chamber = rep.origin_chamber === "Senate" ? "Senator" : "Representative";

  const partyColor =
    party === "R" ? "#dc2626" : party === "D" ? "#2563eb" : "#6b7280";
  const partyLabel =
    party === "R" ? "Republican" : party === "D" ? "Democrat" : "Independent";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          fontFamily: "sans-serif",
          borderTop: `16px solid #dc2626`,
        }}
      >
        {/* Top: site name */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              fontSize: 18,
              color: "#9ca3af",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            WHO KILLED THE BILL?
          </div>
        </div>

        {/* Middle: rep info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                background: partyColor,
                color: "#ffffff",
                fontSize: 18,
                fontWeight: 700,
                padding: "6px 16px",
                borderRadius: "6px",
              }}
            >
              {partyLabel}
            </div>
            <div style={{ fontSize: 18, color: "#9ca3af", fontWeight: 600 }}>
              {location} · {chamber}
            </div>
          </div>

          <div style={{ fontSize: 64, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>
            {name}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginTop: "8px" }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: "#dc2626", lineHeight: 1 }}>
              {count}
            </div>
            <div style={{ fontSize: 28, color: "#6b7280", fontWeight: 600 }}>
              bills introduced.{"\n"}Every one abandoned.
            </div>
          </div>
        </div>

        {/* Bottom: tagline */}
        <div
          style={{
            fontSize: 20,
            color: "#9ca3af",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "24px",
          }}
        >
          No hearing. No vote. No explanation. · whokilledthebill.com
        </div>
      </div>
    ),
    { ...size }
  );
}
