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
  const [search,   setSearch]   = useState("");
  const [sortKey,  setSortKey]  = useState<SortKey>("days");
  const [page,     setPage]     = useState(1);
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
        (b.sponsor_name ?? "").toLowerCase().includes(q) ||
        b.number.includes(q) ||
        (b.policy_area ?? "").toLowerCase().includes(q)
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

  function reset() { setPage(1); }

  return (
    <div className="bg-zinc-950 min-h-screen">

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2 items-center">

            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">⌕</span>
              <input
                type="search"
                placeholder="Search bills, sponsors, keywords…"
                value={search}
                onChange={e => { setSearch(e.target.value); reset(); }}
                className="w-full pl-7 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded
                           text-xs text-zinc-200 placeholder-zinc-600
                           focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>

            {/* Chamber */}
            <FilterPills
              options={[
                { value: "all",    label: "All chambers" },
                { value: "House",  label: "House" },
                { value: "Senate", label: "Senate" },
              ]}
              value={chamber}
              onChange={v => { setChamber(v); reset(); }}
            />

            {/* Party */}
            <FilterPills
              options={[
                { value: "all", label: "All parties" },
                { value: "R",   label: "Republican" },
                { value: "D",   label: "Democrat" },
                { value: "I",   label: "Independent" },
              ]}
              value={party}
              onChange={v => { setParty(v); reset(); }}
            />

            {/* Min days */}
            <FilterPills
              options={[
                { value: "0",    label: "Any age" },
                { value: "365",  label: "1+ yr" },
                { value: "730",  label: "2+ yrs" },
              ]}
              value={String(minDays)}
              onChange={v => { setMinDays(Number(v)); reset(); }}
            />

            {/* Policy area */}
            <select
              value={policy}
              onChange={e => { setPolicy(e.target.value); reset(); }}
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded
                         text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-500"
            >
              <option value="all">All policy areas</option>
              {policyAreas.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sortKey}
              onChange={e => { setSortKey(e.target.value as SortKey); reset(); }}
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded
                         text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-500"
            >
              <option value="days">Most abandoned</option>
              <option value="introduced">Earliest introduced</option>
              <option value="sponsor">By sponsor</option>
            </select>
          </div>

          {/* Result count */}
          <div className="mt-2 font-mono text-[10px] text-zinc-600 tracking-widest uppercase">
            {filtered.length.toLocaleString()} bills in the graveyard
            {filtered.length !== sorted.length ? "" : ""}
          </div>
        </div>
      </div>

      {/* ── Card grid ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {pageRows.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-zinc-700 font-mono text-sm tracking-widest">NO BILLS MATCH THESE FILTERS</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pageRows.map(bill => <BillCard key={bill.id} bill={bill} />)}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="font-mono text-xs tracking-widest text-zinc-500 border border-zinc-700
                         px-4 py-2 rounded hover:border-zinc-500 hover:text-zinc-300
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase"
            >
              ← Prev
            </button>
            <span className="font-mono text-xs text-zinc-600">
              Page {page} / {totalPages} &nbsp;·&nbsp; {sorted.length.toLocaleString()} bills
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="font-mono text-xs tracking-widest text-zinc-500 border border-zinc-700
                         px-4 py-2 rounded hover:border-zinc-500 hover:text-zinc-300
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface PillOption { value: string; label: string; }

function FilterPills({ options, value, onChange }: {
  options: PillOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1.5 rounded font-mono text-[10px] tracking-wide border transition-colors uppercase
            ${value === opt.value
              ? "bg-zinc-200 text-zinc-900 border-zinc-200"
              : "bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
