import { createServerSupabaseClient } from "@/lib/supabase";
import Hero from "@/app/components/Hero";
import BillGrid from "@/app/components/BillGrid";

export const revalidate = 0;

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
    .limit(10000)
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
    <div className="min-h-screen bg-zinc-950">
      <Hero
        totalBills={totalCount ?? 0}
        abandonedBills={abandonedCount ?? 0}
      />

      <BillGrid bills={bills ?? []} policyAreas={policyAreas} />

      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-6 justify-between items-start">
            <div>
              <p className="font-mono text-xs text-zinc-600 tracking-widest uppercase mb-1">
                Who Killed the Bill?
              </p>
              <p className="text-xs text-zinc-700 max-w-sm">
                A public-interest project. Data sourced from the official Congress.gov API
                (Library of Congress). A bill is considered abandoned if its only recorded
                actions are introduction and committee referral, with no subsequent hearing,
                markup, or floor vote for 180+ days.
              </p>
            </div>
            <div className="font-mono text-[10px] text-zinc-700 text-right">
              <p>119th Congress</p>
              <p>Jan 3, 2025 – present</p>
              <p className="mt-1">Data: Congress.gov</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
