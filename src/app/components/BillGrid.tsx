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
  const [chamber,  setChamber]  = useState("all");
  const [party,    setParty]    = useState("all");
  const [policy,   setPolicy]   = useState("all");
  const [minDays,  setMinDays]  = useState(0);
  const [search,    setSearch]  = useState(() => { if (typeof window !== "undefined") { const p = new URLSearchParams(window.location.search); return p.get("state") ?? p.get("rep") ?? ""; } return ""; });
  const [sortKey,  setSortKey]  = useState<SortKey>("days");
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 48;
  const stateParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("state") : null;

  const filtered = useMemo(() => {
    let rows = bills;
    if (chamber !== "all") rows = rows.filter(b => b.origin_chamber === chamber);
    if (party   !== "all") rows = rows.filter(b => b.sponsor_party   === party);
    if (policy  !== "all") rows = rows.filter(b => b.policy_area     === policy);
    if (minDays  > 0)      rows = rows.filter(b => daysSince(b.latest_action_date) >= minDays);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.sponsor_name  ?? "").toLowerCase().includes(q) ||
        (b.policy_area   ?? "").toLowerCase().includes(q) ||
        b.number.includes(q)||
        (b.sponsor_state ?? "").toLowerCase().includes(q)
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

  const selectClass = "px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500";
  const selectStyle = { background: "#161b22", border: "1px solid #30363d", color: "#e6edf3" };

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }}>
      {stateParam && <div style={{ borderLeft: "3px solid #dc2626", background: "#F9F3EE", border: "1px solid #DDC9B4", borderRadius: "6px", padding: "10px 16px", margin: "1rem", fontSize: "14px", color: "#111", lineHeight: 1.6 }}><span style={{ fontWeight: 700, color: "#dc2626" }}>Showing abandoned bills from {stateParam} representatives.</span> Your elected officials introduced these bills — and let every one die. No hearing. No vote. No explanation.</div>}
      <div className="sticky top-14 z-20" style={{ background: "#161b22", borderBottom: "1px solid #30363d" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-52">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{ color: "#8b9198" }}>⌕</span>
              <input
                type="search"
                placeholder="Search bills, sponsors, keywords…"
                value={search}
                onChange={e => { setSearch(e.target.value); reset(); }}
                className="w-full pl-8 pr-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ background: "#0d1117", border: "1px solid #30363d", color: "#e6edf3" }}
              />
            </div>
            <select value={chamber} onChange={e => { setChamber(e.target.value); reset(); }} className={selectClass} style={selectStyle}>
              <option value="all">All chambers</option>
              <option value="House">House</option>
              <option value="Senate">Senate</option>
            </select>
            <select value={party} onChange={e => { setParty(e.target.value); reset(); }} className={selectClass} style={selectStyle}>
              <option value="all">All parties</option>
              <option value="R">Republican</option>
              <option value="D">Democrat</option>
              <option value="I">Independent</option>
            </select>
            <select value={String(minDays)} onChange={e => { setMinDays(Number(e.target.value)); reset(); }} className={selectClass} style={selectStyle}>
              <option value="0">Any duration</option>
              <option value="365">Abandoned 1+ year</option>
              <option value="730">Abandoned 2+ years</option>
            </select>
            <select value={policy} onChange={e => { setPolicy(e.target.value); reset(); }} className={`${selectClass} max-w-[180px]`} style={selectStyle}>
              <option value="all">All policy areas</option>
              {policyAreas.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={sortKey} onChange={e => { setSortKey(e.target.value as SortKey); reset(); }} className={selectClass} style={selectStyle}>
              <option value="days">Most abandoned first</option>
              <option value="introduced">Earliest introduced</option>
              <option value="sponsor">By sponsor name</option>
            </select>
          </div>
          <div className="mt-2 text-sm" style={{ color: "#8b9198" }}>
            Showing <span className="font-semibold" style={{ color: "#e6edf3" }}>{filtered.length.toLocaleString()}</span>
            {" of "}
            <span className="font-semibold" style={{ color: "#e6edf3" }}>{bills.length.toLocaleString()}</span>
            {" "}abandoned bills
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pageRows.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg font-medium" style={{ color: "#8b9198" }}>No bills match the current filters.</p>
            <p className="text-sm mt-1" style={{ color: "#8b9198" }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pageRows.map(bill => <BillCard key={bill.id} bill={bill} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3" }}
            >
              ← Previous
            </button>
            <span className="text-sm" style={{ color: "#8b9198" }}>
              Page {page} of {totalPages} &nbsp;·&nbsp; {sorted.length.toLocaleString()} results
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3" }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}