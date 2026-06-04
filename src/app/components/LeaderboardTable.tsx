"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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

const PARTY_COLORS: Record<string, string> = {
  R: "text-red-700 bg-[#F9F3EE] border-[#DDC9B4]",
  D: "text-blue-700 bg-blue-50 border-blue-200",
  I: "text-gray-600 bg-gray-100 border-gray-300",
};

export default function LeaderboardTable({ reps }: { reps: RepStats[] }) {
  const [party, setParty] = useState("all");
  const [chamber, setChamber] = useState("all");
  const [sort, setSort] = useState("abandoned");

  const filtered = useMemo(() => {
    let rows = reps;
    if (party !== "all") rows = rows.filter(r => r.party === party);
    if (chamber !== "all") rows = rows.filter(r => r.chamber === chamber);
    return [...rows].sort((a, b) => {
      if (sort === "abandoned") return b.abandoned - a.abandoned || a.name.localeCompare(b.name);
      if (sort === "rate") return (b.abandoned / b.total) - (a.abandoned / a.total);
      return a.name.localeCompare(b.name);
    });
  }, [reps, party, chamber, sort]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={party}
          onChange={e => setParty(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All parties</option>
          <option value="R">Republican</option>
          <option value="D">Democrat</option>
          <option value="I">Independent</option>
        </select>

        <select
          value={chamber}
          onChange={e => setChamber(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All chambers</option>
          <option value="House">House</option>
          <option value="Senate">Senate</option>
        </select>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="abandoned">Most abandoned first</option>
          <option value="rate">Highest rate first</option>
          <option value="name">By name</option>
        </select>

        <span className="self-center text-sm text-gray-500">
          {filtered.length} members
        </span>
      </div>

      {/* Table */}
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
            {filtered.map((rep, i) => {
              const rate = Math.round((rep.abandoned / rep.total) * 100);
              const district = rep.district ? `-${rep.district}` : "";
              const location = rep.state ? `${rep.state}${district}` : "";
              const partyColor = PARTY_COLORS[rep.party] ?? PARTY_COLORS["I"];
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
                      {rep.party}
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
  );
}
