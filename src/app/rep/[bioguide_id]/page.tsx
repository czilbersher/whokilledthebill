import { createServerSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { BillRow } from "@/types/db";

function fmt(dateStr: string | null) {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function daysSince(d: string | null) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

const PARTY_LABELS: Record<string, string> = {
  R: "Republican", D: "Democrat", I: "Independent",
};

const PARTY_COLORS: Record<string, string> = {
  R: "text-red-700 bg-red-50 border-red-200",
  D: "text-blue-700 bg-blue-50 border-blue-200",
  I: "text-gray-600 bg-gray-100 border-gray-300",
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
    .order("latest_action_date", { ascending: true });

  if (!bills || bills.length === 0) notFound();

  const rep = bills[0] as BillRow;
  const sponsorName = (rep.sponsor_name ?? "Unknown").replace(/^(Rep\.|Sen\.)\s/, "");
  const party = rep.sponsor_party ?? "I";
  const partyLabel = PARTY_LABELS[party] ?? "Independent";
  const partyColor = PARTY_COLORS[party] ?? PARTY_COLORS["I"];
  const district = rep.sponsor_district ? `-${rep.sponsor_district}` : "";
  const location = rep.sponsor_state ? `${rep.sponsor_state}${district}` : "";

  const policyCounts: Record<string, number> = {};
  for (const b of bills as BillRow[]) {
    const p = b.policy_area ?? "Uncategorized";
    policyCounts[p] = (policyCounts[p] ?? 0) + 1;
  }
  const topPolicies = Object.entries(policyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const avgDays = Math.round(
    (bills as BillRow[]).reduce((sum, b) => sum + daysSince(b.latest_action_date), 0) / bills.length
  );

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
     <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-red-600 hover:text-red-800 font-medium">
            ← Back to all bills
          </Link>
    <a    
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${sponsorName} introduced ${bills.length} bills in the 119th Congress. Every single one died in committee. No hearing. No vote. No explanation.`)}&url=${encodeURIComponent(`https://whokilledthebill.com/rep/${bioguide_id}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </a>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${partyColor}`}>
                  {partyLabel}
                </span>
                {location && <span className="text-sm text-gray-500 font-mono">{location}</span>}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{sponsorName}</h1>
              <p className="mt-2 text-gray-500 text-sm">
                119th Congress · {rep.origin_chamber === "Senate" ? "Senator" : "Representative"}
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">{bills.length}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Bills abandoned</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800">{avgDays.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Avg days ignored</div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-md">
            <p className="text-sm font-bold text-red-700">100% abandonment rate</p>
            <p className="text-sm text-red-600 mt-0.5">Every bill this member introduced in the 119th Congress died in committee with no hearing, no vote, and no explanation.</p>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Abandoned Bills ({bills.length})</h2>
          {(bills as BillRow[]).map((bill) => (
            <div key={bill.id} className="bg-white rounded-md border border-gray-200 p-4 shadow-sm" style={{ borderLeft: "4px solid #dc2626" }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <a href={bill.legislation_url ?? "#"} target="_blank" rel="noreferrer" className="font-mono text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
                  {bill.bill_type?.toUpperCase()} {bill.number}
                </a>
                <span className="text-sm font-bold text-red-600 whitespace-nowrap">{daysSince(bill.latest_action_date).toLocaleString()} days</span>
              </div>
              <p className="text-sm font-medium text-gray-900 leading-snug mb-2">{bill.title}</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                <span>Introduced {fmt(bill.introduced_date)}</span>
                {bill.policy_area && <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{bill.policy_area}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Bills by Policy Area</h3>
            <div className="space-y-2">
              {topPolicies.map(([area, count]) => (
                <div key={area} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-600 leading-tight">{area}</span>
                  <span className="text-sm font-bold text-red-600 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">About This Data</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Data sourced from the official Congress.gov API. A bill is considered abandoned if its only recorded actions are introduction and committee referral, with no subsequent hearing, markup, or floor vote for 180+ days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
