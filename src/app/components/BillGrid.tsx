"use client";

import { useState, useMemo, useEffect } from "react";
import BillCard from "./BillCard";
import type { BillRow } from "@/types/db";

type SortKey = "days" | "introduced" | "sponsor";

function daysSince(d: string | null): number | null {
  if (!d) return null;
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const policyParam = p.get("policy");
      const repParam = p.get("rep");
      const stateParam = p.get("state");
      if (policyParam) setPolicy(policyParam);
      if (repParam) setSearch(repParam);
      if (stateParam) setChamber("all");
    }
  }, []);

  const filtered = useMemo(() => {
    let rows = bills;
    if (chamber !== "all") rows = rows.filter(b => b.origin_chamber === chamber);
    if (party   !== "all") rows = rows.filter(b => b.sponsor_party   === party);
    if (policy  !== "all") rows = rows.filter(b => b.policy_area     === policy);
    if (minDays > 0)       rows = rows.filter(b => (daysSince(b.latest_action_date) ?? 0) >= minDays);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.sponsor_name?.toLowerCase().includes(q) ||
        b.number?.toLowerCase().includes(q) ||
        b.policy_area?.toLowerCase().includes(q) ||
        b.sponsor_state?.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      if (sortKey === "days")        return (daysSince(a.latest_action_date) ?? 0) > (daysSince(b.latest_action_date) ?? 0) ? -1 : 1;
      if (sortKey === "introduced")  return (a.introduced_date ?? "") < (b.introduced_date ?? "") ? -1 : 1;
      if (sortKey === "sponsor")     return (a.sponsor_name ?? "").localeCompare(b.sponsor_name ?? "");
      return 0;
    });
  }, [bills, chamber, party, policy, minDays, search, sortKey]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#8b9198", fontSize: "14px" }}>🔍</span>
          <input
            type="text"
            placeholder="Search bills, sponsors, keywords"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "8px 8px 8px 32px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px", color: "#e6edf3", fontSize: "14px", boxSizing: "border-box" }}
          />
        </div>

        <select value={chamber} onChange={e => { setChamber(e.target.value); setPage(1); }} style={{ padding: "8px 12px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px", color: "#e6edf3", fontSize: "14px" }}>
          <option value="all">All chambers</option>
          <option value="House">House</option>
          <option value="Senate">Senate</option>
        </select>

        <select value={party} onChange={e => { setParty(e.target.value); setPage(1); }} style={{ padding: "8px 12px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px", color: "#e6edf3", fontSize: "14px" }}>
          <option value="all">All parties</option>
          <option value="R">Republican</option>
          <option value="D">Democrat</option>
          <option value="I">Independent</option>
        </select>

        <select value={minDays} onChange={e => { setMinDays(Number(e.target.value)); setPage(1); }} style={{ padding: "8px 12px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px", color: "#e6edf3", fontSize: "14px" }}>
          <option value={0}>Any duration</option>
          <option value={90}>90+ days</option>
          <option value={180}>180+ days</option>
          <option value={365}>365+ days</option>
        </select>

        <select value={policy} onChange={e => { setPolicy(e.target.value); setPage(1); }} style={{ padding: "8px 12px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px", color: "#e6edf3", fontSize: "14px" }}>
          <option value="all">All policy areas</option>
          {policyAreas.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={sortKey} onChange={e => { setSortKey(e.target.value as SortKey); setPage(1); }} style={{ padding: "8px 12px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px", color: "#e6edf3", fontSize: "14px" }}>
          <option value="days">Most abandoned first</option>
          <option value="introduced">Introduced date</option>
          <option value="sponsor">Sponsor name</option>
        </select>
      </div>

      <p style={{ color: "#8b9198", fontSize: "14px", marginBottom: "1rem" }}>
        Showing <strong style={{ color: "#e6edf3" }}>{filtered.length.toLocaleString()}</strong> of <strong style={{ color: "#e6edf3" }}>{bills.length.toLocaleString()}</strong> abandoned bills
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {paginated.map(bill => <BillCard key={bill.id} bill={bill} />)}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 16px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px", color: "#e6edf3", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
          <span style={{ padding: "8px 16px", color: "#8b9198" }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "8px 16px", backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px", color: "#e6edf3", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
        </div>
      )}
    </div>
  );
}