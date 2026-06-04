import { createServerSupabaseClient } from "@/lib/supabase";
import Link from "next/link";
import type { BillRow } from "@/types/db";
import LeaderboardTable from "@/app/components/LeaderboardTable";

export const revalidate = 3600;

export default async function LeaderboardPage() {
  const supabase = createServerSupabaseClient();

  const { data: bills } = await supabase
    .from("bills")
    .select("sponsor_name, sponsor_bioguide_id, sponsor_party, sponsor_state, sponsor_district, origin_chamber, is_abandoned")
    .not("sponsor_bioguide_id", "is", null)
    .limit(10000);

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
        <LeaderboardTable reps={ranked} />
      </div>
    </div>
  );
}
