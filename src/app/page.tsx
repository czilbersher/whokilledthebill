import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase";
import Hero from "@/app/components/Hero";
import BillGrid from "@/app/components/BillGrid";

export const revalidate = 3600;

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const [
    { data: bills },
    { count: totalCount },
    { count: abandonedCount },
    { data: policyRows },
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
  ]);

  const policyAreas = [
    ...new Set((policyRows ?? []).map(r => (r as { policy_area: string }).policy_area)),
  ].sort();

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }}>
      <Hero
        totalBills={totalCount ?? 0}
        abandonedBills={abandonedCount ?? 0}
      />
      <Suspense fallback={null}>
        <BillGrid bills={bills ?? []} policyAreas={policyAreas} />
      </Suspense>
      <footer style={{ background: "#161b22", borderTop: "1px solid #30363d" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-6 justify-between items-start">
            <div>
              <p
                className="font-mono text-xs tracking-widest uppercase mb-1"
                style={{ color: "#8b9198" }}
              >
                Who Killed the Bill?
              </p>
              <p
                className="text-xs max-w-sm"
                style={{ color: "#8b9198" }}
              >
                A public-interest project. Data sourced from the official Congress.gov API
                (Library of Congress). A bill is considered abandoned if its only recorded
                actions are introduction and committee referral, with no subsequent hearing,
                markup, or floor vote for 180+ days.
              </p>
            </div>
            <div
              className="font-mono text-[10px] text-right"
              style={{ color: "#8b9198" }}
            >
              <p>119th Congress</p>
              <p>Jan 3, 2025 &#8211; present</p>
              <p className="mt-1">Data: Congress.gov</p>
              <p className="mt-1">Last updated: June 5, 2026</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}