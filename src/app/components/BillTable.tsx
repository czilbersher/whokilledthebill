"use client";

import { useState, useMemo } from "react";
import type { BillRow } from "@/types/db";

const PARTY_LABEL: Record<string, string> = { R: "Republican", D: "Democrat", I: "Independent" };

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function DaysBadge({ date }: { date: string | null }) {
  const days = daysSince(date);
  if (days === null) return <span className="text-gray-400">—</span>;
  const color =
    days > 730  ? "bg-red-100 text-red-800 border-red-300" :
    days > 365  ? "bg-orange-100 text-orange-800 border-orange-300" :
                  "bg-yellow-100 text-yellow-800 border-yellow-300";
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-mono font-semibold ${color}`}>
      {days.toLocaleString()}d
    </span>
  );
}

function PartyBadge({ party }: { party: string | null }) {
  if (!party) return <span className="text-gray-400">—</span>;
  const color =
    party === "R" ? "text-red-700 bg-[#F9F3EE] border-[#DDC9B4]" :
    party === "D" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-gray-100 text-gray-600 border-gray-300";
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded border text-xs font-semibold ${color}`}
      title={PARTY_LABEL[party] ?? party}>
      {party}
    </span>
  );
}

type SortKey = "days" | "introduced" | "sponsor" | "title";

interface Props {
  bills: BillRow[];
  policyAreas: string[];
}

export default function BillTable({ bills, policyAreas }: Props) {
  const [chamber, setChamber]   = useState("all");
  const [party, setParty]       = useState("all");
  const [policy, setPolicy]     = useState("all");
  const [search, setSearch]     = useState("");
  const [sortKey, setSortKey]   = useState<SortKey>("days");
  const [sortAsc, setSortAsc]   = useState(false);
  const [page, setPage]         = useState(1);
  const PER_PAGE = 50;

  const filtered = useMemo(() => {
    let rows = bills;
    if (chamber !== "all") rows = rows.filter(b => b.origin_chamber === chamber);
    if (party   !== "all") rows = rows.filter(b => b.sponsor_party  === party);
    if (policy  !== "all") rows = rows.filter(b => b.policy_area    === policy);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.sponsor_name ?? "").toLowerCase().includes(q) ||
        b.number.includes(q)
      );
    }
    return rows;
  }, [bills, chamber, party, policy, search]);

  const sorted = useMemo(() => {
    const dir = sortAsc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "days") {
        return dir * ((daysSince(a.latest_action_date) ?? 0) - (daysSince(b.latest_action_date) ?? 0));
      }
      if (sortKey === "introduced") {
        return dir * ((a.introduced_date ?? "").localeCompare(b.introduced_date ?? ""));
      }
      if (sortKey === "sponsor") {
        return dir * ((a.sponsor_name ?? "").localeCompare(b.sponsor_name ?? ""));
      }
      return dir * a.title.localeCompare(b.title);
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const pageRows   = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(false); }
    setPage(1);
  }

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <button onClick={() => toggleSort(k)}
        className={`flex items-center gap-1 font-semibold uppercase tracking-wide text-xs transition-colors
          ${active ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
        {label}
        <span className="text-[10px]">{active ? (sortAsc ? "↑" : "↓") : "↕"}</span>
      </button>
    );
  }

  const filterChange = () => setPage(1);

  return (
    <div>
      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="search"
          placeholder="Search bills or sponsors…"
          value={search}
          onChange={e => { setSearch(e.target.value); filterChange(); }}
          className="flex-1 min-w-48 px-3 py-2 rounded bg-slate-800 border border-slate-600
            text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        <select value={chamber} onChange={e => { setChamber(e.target.value); filterChange(); }}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-sm text-white">
          <option value="all">All chambers</option>
          <option value="House">House</option>
          <option value="Senate">Senate</option>
        </select>
        <select value={party} onChange={e => { setParty(e.target.value); filterChange(); }}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-sm text-white">
          <option value="all">All parties</option>
          <option value="R">Republican</option>
          <option value="D">Democrat</option>
          <option value="I">Independent</option>
        </select>
        <select value={policy} onChange={e => { setPolicy(e.target.value); filterChange(); }}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-sm text-white min-w-44">
          <option value="all">All policy areas</option>
          {policyAreas.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* ── Results count ──────────────────────────────────────────────────── */}
      <div className="text-sm text-slate-400 mb-3">
        {filtered.length.toLocaleString()} bill{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              <th className="px-4 py-3 text-left">
                <SortHeader label="Bill" k="title" />
              </th>
              <th className="px-4 py-3 text-left max-w-xs">
                <SortHeader label="Title" k="title" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Sponsor" k="sponsor" />
              </th>
              <th className="px-4 py-3 text-left">Party</th>
              <th className="px-4 py-3 text-left">State</th>
              <th className="px-4 py-3 text-left">Policy Area</th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Introduced" k="introduced" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Days Ignored" k="days" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {pageRows.map((bill, i) => (
              <tr key={bill.id}
                className={`group transition-colors hover:bg-slate-800/60
                  ${i % 2 === 0 ? "bg-slate-900" : "bg-slate-900/50"}`}>
                <td className="px-4 py-3 font-mono text-xs text-slate-300 whitespace-nowrap">
                  <a href={bill.legislation_url ?? "#"} target="_blank" rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline font-semibold">
                    {bill.bill_type.toUpperCase()} {bill.number}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-200 max-w-xs">
                  <span className="line-clamp-2 leading-snug" title={bill.title}>
                    {bill.title}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                  {bill.sponsor_name
                    ? bill.sponsor_name.replace(/^Rep\.\s|^Sen\.\s/, "")
                    : <span className="text-gray-500">Unknown</span>}
                </td>
                <td className="px-4 py-3">
                  <PartyBadge party={bill.sponsor_party} />
                </td>
                <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                  {bill.sponsor_state ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                  {bill.policy_area ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap font-mono">
                  {bill.introduced_date
                    ? new Date(bill.introduced_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <DaysBadge date={bill.latest_action_date} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pageRows.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            No bills match the current filters.
          </div>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded border border-slate-600 text-slate-300 disabled:opacity-40
              hover:bg-slate-800 transition-colors">
            ← Previous
          </button>
          <span className="text-slate-400">
            Page {page} of {totalPages} &nbsp;·&nbsp; {sorted.length.toLocaleString()} results
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded border border-slate-600 text-slate-300 disabled:opacity-40
              hover:bg-slate-800 transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
