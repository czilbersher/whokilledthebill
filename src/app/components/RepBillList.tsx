"use client";

import { useState } from "react";
import Link from "next/link";
import type { BillRow } from "@/types/db";

function daysSince(d: string | null) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

function fmt(dateStr: string | null) {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

interface Props {
  bills: BillRow[];
  topPolicies: [string, number][];
}

export default function RepBillList({ bills, topPolicies }: Props) {
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  const filtered = activePolicy
    ? bills.filter(b => b.policy_area === activePolicy)
    : bills;

  return (
    <div style={{ maxWidth: "64rem", margin: "2rem auto", padding: "0 1.5rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>

      {/* Bills list */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
            Abandoned Bills ({filtered.length}{activePolicy ? ` in ${activePolicy}` : ""})
          </h2>
          <select
            value={activePolicy ?? ""}
            onChange={e => setActivePolicy(e.target.value || null)}
            style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "4px", fontSize: "13px", color: "#374151", backgroundColor: "#fff" }}
          >
            <option value="">All policy areas</option>
            {topPolicies.map(([area]) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((bill) => (
            <div key={bill.id} style={{ backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb", borderLeft: "4px solid #dc2626", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.5rem" }}>
                <a href={bill.legislation_url ?? "#"} target="_blank" rel="noreferrer" style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "#6b7280", textDecoration: "none" }}>
                  {bill.bill_type?.toUpperCase()} {bill.number}
                </a>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626", whiteSpace: "nowrap" }}>{daysSince(bill.latest_action_date).toLocaleString()} days</span>
              </div>
              <p style={{ fontSize: "14px", color: "#111827", marginBottom: "0.5rem", lineHeight: 1.4 }}>{bill.title}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>Introduced {fmt(bill.introduced_date)}</span>
                {bill.policy_area && (
                  <button
                    onClick={() => setActivePolicy(bill.policy_area)}
                    style={{ fontSize: "12px", backgroundColor: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                  >
                    {bill.policy_area}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Bills by Policy Area</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {activePolicy && (
              <button
                onClick={() => setActivePolicy(null)}
                style={{ fontSize: "12px", color: "#dc2626", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, marginBottom: "0.25rem" }}
              >
                ← Show all bills
              </button>
            )}
            {topPolicies.map(([area, count]) => (
              <button
                key={area}
                onClick={() => setActivePolicy(area === activePolicy ? null : area)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                  borderBottom: area === activePolicy ? "1px solid #dc2626" : "none",
                }}
              >
                <span style={{ fontSize: "13px", color: area === activePolicy ? "#dc2626" : "#374151", fontWeight: area === activePolicy ? 700 : 400 }}>{area}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626" }}>{count}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>About This Data</h3>
          <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5, margin: 0 }}>Data sourced from the official Congress.gov API. Bills are marked abandoned if referred to committee with no hearing, markup, or vote recorded.</p>
        </div>
      </div>

    </div>
  );
}