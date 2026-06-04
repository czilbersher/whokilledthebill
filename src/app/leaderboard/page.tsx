import { createServerSupabaseClient } from "@/lib/supabase";
import Link from "next/link";
import type { BillRow } from "@/types/db";

export const revalidate = 3600;

export default async function LeaderboardPage() {
  const supabase = createServerSupabaseClient();

  const { data: bills } = await supabase
    .from("bills")
    .select("sponsor_name, sponsor_bioguide_id, sponsor_party, sponsor_state, sponsor_district, origin_chamber, is_abandoned")
    .not("sponsor_bioguide_id", "is", null);

  if (!bills) return <div>No data available.</div>;

  type RepStats = {
    name: string;
    bioguide_id: string;
    party: string;
    state: string;
    district: number | null;
    chamber: string;
    total: number;
    abandoned: number;
  };

  const repMap: Record<string, RepStats> = {};

  for (const bill of bills as BillRow[]) {
    const id = bill.sponsor_bioguide_id!;
    if (!repMap[id]) {
      repMap[id] = {
        name: (bill.sponsor_name ?? "Unknown").replace(/^(Rep\.|Sen\.)\s/, ""),
        bioguide_id: id,
        party: bill.sponsor_party ?? "I",
        state: bill.sponsor_state ?? "",
        district: bill.sponsor_district ?? null,
        chamber: bill.origin_chamber ?? "",
        total: 0,
        abandoned: 0,
      };
    }
    repMap[id].total += 1;
    if (bill.is_abandoned) repMap[id].abandoned += 1;
  }

  const ranked = Object.values(repMap)
    .filter(r => r.abandoned > 0)
    .sort((a, b) => b.abandoned - a.abandoned || a.name.localeCompare(b.name));

  const PARTY_COLORS: Record<string, string> = {
    R: "text-red-700 bg-red-50 border-red-200",
    D: "text-blue-700 bg-blue-50 border-blue-200",
    I: "text-gray-600 bg-gray-100 border-gray-300",
  };

  const PARTY_LABELS: Record<string, string> = {
    R: "R", D: "D", I: "I",
  };

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-sm text-red-600 hover:text-red-800 font-medium">
            ← Back to all bills
          </Link>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-500 text-sm">
            Members of Congress ranked by number of abandoned bills in the 119th Congress.
            Click any name to see their full record.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-12">Rank</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Member</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Party</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Chamber</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Abandoned</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Total Bills</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Rate</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((rep, i) => {
                const rate = Math.round((rep.abandoned / rep.total) * 100);
                const district = rep.district ? `-${rep.district}` : "";
                const location = rep.state ? `${rep.state}${district}` : "";
                const partyColor = PARTY_COLORS[rep.party] ?? PARTY_COLORS["I"];
                const partyLabel = PARTY_LABELS[rep.party] ?? "I";
                return (
                  <tr key={rep.bioguide_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/rep/${rep.bioguide_id}`} className="font-medium text-gray-900 hover:text-red-600 transition-colors">
                        {rep.name}
                      </Link>
                      {location && <span className="ml-2 text-xs text-gray-400">{location}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold border ${partyColor}`}>
                        {partyLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{rep.chamber}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{rep.abandoned}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{rep.total}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
