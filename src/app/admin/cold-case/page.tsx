"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function daysSince(d: string | null) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

export default function ColdCaseCurator() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCandidates() {
      const { data } = await supabase
        .from("bills")
        .select("*")
        .order("action_count", { ascending: true })
        .limit(200);

      if (!data) return;

      const scored = data
        .map((b: any) => {
          let score = 0;
          const days = daysSince(b.latest_action_date);
          if (days > 400) score += 3;
          else if (days > 300) score += 2;
          else if (days > 200) score += 1;
          if (b.sponsor_party === "R" || b.sponsor_party === "D") score += 1;
          if (b.policy_area === "Health" || b.policy_area === "Housing and Community Development") score += 2;
          if (b.policy_area === "Education" || b.policy_area === "Economics and Public Finance") score += 1;
          return { ...b, score };
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3);

      setCandidates(scored);
      setLoading(false);
    }
    fetchCandidates();
  }, []);

  async function selectBill(bill: any) {
    const slug = bill.bill_type + "-" + bill.number;
    setSelecting(slug);

    await supabase
      .from("cold_cases")
      .update({ is_current: false })
      .eq("is_current", true);

    await supabase
      .from("cold_cases")
      .insert({
        bill_slug: slug,
        featured_week: new Date().toISOString().split("T")[0],
        is_current: true,
      });

    setSelected(slug);
    setSelecting(null);
  }

  return (
    <div style={{ backgroundColor: "#0d1117", minHeight: "100vh", padding: "2rem", fontFamily: "monospace" }}>
      <h1 style={{ color: "#e6edf3", fontSize: "24px", marginBottom: "0.5rem" }}>Cold Case Curator</h1>
      <p style={{ color: "#8b9198", marginBottom: "2rem", fontSize: "14px" }}>Pick this week&apos;s featured cold case. The public page will auto-generate the narrative.</p>

      {loading && <p style={{ color: "#8b9198" }}>Scoring candidates...</p>}

      {selected && (
        <div style={{ backgroundColor: "#1a3a1a", border: "1px solid #2ea043", borderRadius: "8px", padding: "1rem", marginBottom: "2rem" }}>
          <p style={{ color: "#2ea043", margin: 0, fontWeight: 700 }}>&#10003; Cold case set: {selected}</p>
          <p style={{ color: "#8b9198", margin: "4px 0 0 0", fontSize: "13px" }}>Visit <a href="/cold-case" style={{ color: "#58a6ff" }}>/cold-case</a> to see the generated narrative.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {candidates.map((bill) => {
          const slug = bill.bill_type + "-" + bill.number;
          const days = daysSince(bill.latest_action_date);
          const sponsorRaw = bill.sponsor_name ?? "";
          const nameNoTitle = sponsorRaw.replace(/\s*\[.*?\]\s*/g, "").replace(/^(Rep\.|Sen\.|Del\.)\s*/i, "").trim();
          const nameParts = nameNoTitle.split(",");
          const sponsorName = nameParts.length === 2 ? nameParts[1].trim() + " " + nameParts[0].trim() : nameNoTitle;

          return (
            <div key={slug} style={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderLeft: "4px solid #dc2626", borderRadius: "8px", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    {bill.bill_type?.toUpperCase()} {bill.number} &mdash; {days.toLocaleString()} days ignored
                  </div>
                  <div style={{ color: "#e6edf3", fontSize: "15px", fontWeight: 600, marginBottom: "6px", lineHeight: 1.4 }}>
                    {bill.title}
                  </div>
                  <div style={{ color: "#8b9198", fontSize: "13px" }}>
                    {sponsorName} &bull; {bill.sponsor_party} &bull; {bill.sponsor_state} &bull; {bill.policy_area}
                  </div>
                </div>
                <button
                  onClick={() => selectBill(bill)}
                  disabled={!!selecting}
                  style={{ backgroundColor: selecting === slug ? "#21262d" : "#dc2626", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: 700, cursor: selecting ? "wait" : "pointer", whiteSpace: "nowrap" }}
                >
                  {selecting === slug ? "Setting..." : "Select This Bill"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
