"use client";

import { useState, useMemo } from "react";
import BillCard from "./BillCard";
import type { BillRow } from "@/types/db";

type SortKey = "days" | "introduced" | "sponsor";

function daysSince(d: string | null) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

interface Props {
  bills: BillRow[];
  policyAreas: string[];
}

export default function BillGrid({ bills, policyAreas }: Props) {
  const [chamber, setChamber] = useState("all");
  const [party,   setParty]   = useState("all");
  const [policy,  setPolicy]  = useState("all");
  const [minDays, setMinDays] = useState(0);
  const [search,  setSearch]  = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("days");
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 48;

  const filtered = useMemo(() => {
    let rows = bills;
    if (chamber !== "all") rows = rows.filter(b => b.origin_chamber === chamber);
    if (party   !== "all") rows = rows.filter(b => b.sponsor_party  === party);
    if (policy  !== "all") rows = rows.filter(b => b.policy_area    === policy);
    if (minDays  > 0)      rows = rows.filter(b => daysSince(b.latest_action_date) >= minDays);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.sponsor_name  ?? "").toLowerCase().includes(q) ||
        (b.policy_area   ?? "").toLowerCase().includes(q) ||
        b.number.includes(q)
      );
    }
    return rows;
  }, [bills, chamber, party, policy, minDays, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === "days")       return daysSince(b.latest_action_date) - daysSince(a.latest_action_date);
      if (sortKey === "introduced") return (a.introduced_date ?? "").localeCompare(b.introduced_date ?? "");
      return (a.sponsor_name ?? "").localeCompare(b.sponsor_name ?? "");
    });
  }, [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const pageRows   = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const reset      = () => setPage(1);

  return (
    <div className="bg-[#f8f8f6] min-h-screen">

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-52">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                ⌕
              </span>
              <input
                type="search"
                placeholder="Search bills, sponsors, keywords…"
                value={search}
                onChange={e => { setSearch(e.target.value); reset(); }}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded
                           text-sm text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Chamber */}
            <select
              value={chamber}
              onChange={e => { setChamber(e.target.value); reset(); }}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All chambers</option>
              <option value="House">House</option>
              <option value="Senate">Senate</option>
            </select>

            {/* Party */}
            <select
              value={party}
              onChange={e => { setParty(e.target.value); reset(); }}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All parties</option>
              <option value="R">Republican</option>
              <option value="D">Democrat</option>
              <option value="I">Independent</option>
            </select>

            {/* Abandoned for */}
            <select
              value={String(minDays)}
              onChange={e => { setMinDays(Number(e.target.value)); reset(); }}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="0">Any duration</option>
              <option value="365">Abandoned 1+ year</option>
              <option value="730">Abandoned 2+ years</option>
            </select>

            {/* Policy area */}
            <select
              value={policy}
              onChange={e => { setPolicy(e.target.value); reset(); }}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-red-500 max-w-[180px]"
            >
              <option value="all">All policy areas</option>
              {policyAreas.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sortKey}
              onChange={e => { setSortKey(e.target.value as SortKey); reset(); }}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="days">Most abandoned first</option>
              <option value="introduced">Earliest introduced</option>
              <option value="sponsor">By sponsor name</option>
            </select>
          </div>

          {/* Result count */}
          <div className="mt-2 text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">{filtered.length.toLocaleString()}</span>
            {" "}of{" "}
            <span className="font-semibold text-gray-800">{bills.length.toLocaleString()}</span>
            {" "}abandoned bills
          </div>
        </div>
      </div>

      {/* ── Card grid ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pageRows.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">No bills match the current filters.</p>
            <p className="mt-1 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pageRows.map(bill => <BillCard key={bill.id} bill={bill} />)}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded border border-gray-300 text-sm font-medium
                         text-gray-700 bg-white hover:bg-gray-50
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages} &nbsp;·&nbsp; {sorted.length.toLocaleString()} results
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded border border-gray-300 text-sm font-medium
                         text-gray-700 bg-white hover:bg-gray-50
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
