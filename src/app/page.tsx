import { createServerSupabaseClient } from "@/lib/supabase";
import BillTable from "@/app/components/BillTable";

export const revalidate = 3600; // ISR: rebuild page at most once per hour

async function getStats(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const [{ count: total }, { count: abandoned }] = await Promise.all([
    supabase.from("bills").select("*", { count: "exact", head: true }),
    supabase.from("bills").select("*", { count: "exact", head: true }).eq("is_abandoned", true),
  ]);
  return { total: total ?? 0, abandoned: abandoned ?? 0 };
}

async function getPolicyAreas(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const { data } = await supabase
    .from("bills")
    .select("policy_area")
    .eq("is_abandoned", true)
    .not("policy_area", "is", null);
  const areas = [...new Set((data ?? []).map(r => (r as { policy_area: string }).policy_area))].sort();
  return areas;
}

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const [{ data: bills }, stats, policyAreas] = await Promise.all([
    supabase
      .from("bills")
      .select("*")
      .eq("is_abandoned", true)
      .order("latest_action_date", { ascending: true })
      .limit(2000),
    getStats(supabase),
    getPolicyAreas(supabase),
  ]);

  const pct = stats.total > 0
    ? Math.round((stats.abandoned / stats.total) * 100)
    : 0;

  const isEmpty = !bills || bills.length === 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                WHO KILLED THE BILL?
              </h1>
              <p className="mt-2 text-slate-400 max-w-xl leading-relaxed">
                U.S. federal legislation introduced by elected officials — then abandoned
                in committee without a vote, a hearing, or a reason.
              </p>
            </div>
            <div className="text-xs text-slate-600 text-right">
              119th Congress · Data: Congress.gov
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-8 text-sm">
            <Stat label="Bills tracked" value={stats.total.toLocaleString()} />
            <Stat label="Abandoned in committee" value={stats.abandoned.toLocaleString()} accent />
            <Stat label="Abandonment rate" value={`${pct}%`} accent />
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <BillTable bills={bills} policyAreas={policyAreas} />
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-slate-600 flex flex-wrap gap-4 justify-between">
          <span>Data sourced from the official Congress.gov API (Library of Congress).</span>
          <span>
            A bill is considered abandoned if its last recorded action is a committee referral
            with no subsequent hearings, markups, or floor action for 180+ days.
          </span>
        </div>
      </footer>

    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-xl font-bold ${accent ? "text-red-400" : "text-white"}`}>
        {value}
      </div>
      <div className="text-slate-500 uppercase tracking-wider text-xs mt-0.5">{label}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="text-slate-600 text-6xl mb-4">⚰</div>
      <h2 className="text-xl font-semibold text-slate-400 mb-2">No bills in the database yet</h2>
      <p className="text-slate-600 text-sm max-w-md mx-auto">
        Run the ingest script to populate data from Congress.gov:
      </p>
      <pre className="mt-4 inline-block bg-slate-800 text-slate-300 text-sm px-4 py-3 rounded-lg font-mono">
        node --env-file=.env.local scripts/ingest-bills.mjs
      </pre>
    </div>
  );
}
