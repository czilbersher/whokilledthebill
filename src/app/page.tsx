import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { lastUpdatedLabel } from "@/lib/lastUpdated";
import { freshenNarrative } from "@/lib/narrative";
import Hero from "@/app/components/Hero";
import BillGrid from "@/app/components/BillGrid";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";

export const revalidate = 3600;

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const [
    { data: bills },
    { count: totalCount },
    { count: abandonedCount },
    { data: policyRows },
    { data: coldCase },
  ] = await Promise.all([
    supabase
      .from("bills")
      .select("*")
      .eq("is_abandoned", true)
      .order("latest_action_date", { ascending: true })
      .limit(10000),
    supabase.from("bills").select("*", { count: "exact", head: true }),
    supabase.from("bills").select("*", { count: "exact", head: true }).eq("is_abandoned", true),
    supabase
      .from("bills")
      .select("policy_area")
      .eq("is_abandoned", true)
      .not("policy_area", "is", null),
    supabase
      .from("cold_cases")
      .select("*")
      .eq("is_current", true)
      .limit(1)
      .single(),
  ]);

  const policyAreas = [
    ...new Set((policyRows ?? []).map(r => (r as { policy_area: string }).policy_area)),
  ].sort();

  const cc = coldCase as any;
  const ccSlug = cc?.bill_slug as string ?? null;
  const ccParts = ccSlug ? ccSlug.split("-") : null;
  const ccBillType = ccParts ? ccParts[0] : null;
  const ccNumber = ccParts ? ccParts.slice(1).join("-") : null;

  const { data: ccBillData } = ccBillType && ccNumber ? await supabase
    .from("bills")
    .select("*")
    .eq("bill_type", ccBillType)
    .eq("number", ccNumber)
    .limit(1) : { data: null };

  const ccBill = ccBillData?.[0] as any ?? null;

  function daysSince(d: string | null) {
    if (!d) return 0;
    return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  }

  const ccDays = ccBill ? daysSince(ccBill.latest_action_date) : null;

  const PARTY_COLORS: Record<string, string> = {
    R: "#dc2626", D: "#3b82f6", I: "#6b7280",
  };
  const ccPartyColor = ccBill ? (PARTY_COLORS[ccBill.sponsor_party ?? "I"] ?? "#6b7280") : "#6b7280";

  const sponsorDisplay = (() => {
    if (!ccBill?.sponsor_name) return "";
    const raw = ccBill.sponsor_name.replace(/\s*\[.*?\]\s*/g, "").replace(/^(Rep\.|Sen\.|Del\.)\s*/i, "").trim();
    const parts = raw.split(",");
    return parts.length === 2 ? parts[1].trim() + " " + parts[0].trim() : raw;
  })();

  const narrativeTeaser = cc?.narrative
    ? freshenNarrative(cc.narrative.split("\n\n")[0], ccDays ?? 0)
    : null;

  // Show which week this case is for, so a returning visitor can tell at a
  // glance that it is current rather than something left up for months.
  const ccWeek = cc?.featured_week
    ? formatDate(cc.featured_week, { month: "long", day: "numeric" })
    : null;

  // Oldest abandoned bill drives the headline stat, so it stays true as days pass.
  const oldest = (bills ?? [])[0] as { latest_action_date: string | null } | undefined;
  const longestDays = oldest ? daysSince(oldest.latest_action_date) : 0;

  const lastUpdated = await lastUpdatedLabel(supabase);

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }}>
      <Hero
        totalBills={totalCount ?? 0}
        abandonedBills={abandonedCount ?? 0}
        longestDays={longestDays}
      />

      {cc && ccBill && (
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "2rem 1.5rem 0" }}>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "1.5rem" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <div style={{ width: "8px", height: "8px", background: "#dc2626", borderRadius: "50%" }}></div>
              <span style={{ color: "#dc2626", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Cold Case of the Week</span>
              {ccWeek && (
                <span style={{ color: "#8b9198", fontSize: "11px", fontWeight: 500, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                  Week of {ccWeek}
                </span>
              )}
              <div style={{ flex: 1, height: "1px", background: "#30363d" }}></div>
              <Link href="/cold-case" style={{ color: "#58a6ff", fontSize: "11px", textDecoration: "none" }}>Read the full case file &#8594;</Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "start" }}>
              <div>
                <div style={{ color: "#8b9198", fontSize: "11px", marginBottom: "6px" }}>
                  {ccBill.bill_type?.toUpperCase()} {ccBill.number} &bull; {ccBill.sponsor_state} &bull; {ccBill.policy_area}
                </div>
                <h2 style={{ color: "#e6edf3", fontSize: "17px", fontWeight: 700, lineHeight: 1.4, margin: "0 0 0.75rem 0" }}>
                  {ccBill.title}
                </h2>
                {narrativeTeaser && (
                  <p style={{ color: "#8b9198", fontSize: "13px", lineHeight: 1.7, margin: "0 0 1rem 0" }}>
                    {narrativeTeaser}
                  </p>
                )}
                <Link href="/cold-case" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#dc2626", color: "#fff", fontSize: "13px", fontWeight: 700, padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>
                  Read the Case File &#8594;
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "140px" }}>
                <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", padding: "12px", textAlign: "center" }}>
                  <div style={{ color: "#dc2626", fontSize: "26px", fontWeight: 700 }}>{ccDays?.toLocaleString()}</div>
                  <div style={{ color: "#8b9198", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Days ignored</div>
                </div>
                <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", padding: "12px", textAlign: "center" }}>
                  <div style={{ color: ccPartyColor, fontSize: "13px", fontWeight: 600 }}>{sponsorDisplay}</div>
                  <div style={{ color: "#8b9198", fontSize: "11px" }}>{ccBill.sponsor_party} &bull; {ccBill.sponsor_state}</div>
                </div>
                <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", padding: "12px", textAlign: "center" }}>
                  <div style={{ color: "#e6edf3", fontSize: "12px", fontWeight: 600 }}>Died in Committee</div>
                  <div style={{ color: "#8b9198", fontSize: "11px" }}>No hearing. No vote.</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <BillGrid bills={bills ?? []} policyAreas={policyAreas} />
      </Suspense>

      <footer style={{ background: "#161b22", borderTop: "1px solid #30363d" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-6 justify-between items-start">
            <div>
              <p className="font-mono text-xs tracking-widest uppercase mb-1" style={{ color: "#8b9198" }}>
                Who Killed the Bill?
              </p>
              <p className="text-xs max-w-sm" style={{ color: "#8b9198" }}>
                A public-interest project. Data sourced from the official Congress.gov API
                (Library of Congress). A bill is considered abandoned if its only recorded
                actions are introduction and committee referral, with no subsequent hearing,
                markup, or floor vote for 180+ days.
              </p>
            </div>
            <div className="font-mono text-[10px] text-right" style={{ color: "#8b9198" }}>
              <p>119th Congress</p>
              <p>Jan 3, 2025 &#8211; present</p>
              <p className="mt-1">Data: Congress.gov</p>
              <p className="mt-1">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
