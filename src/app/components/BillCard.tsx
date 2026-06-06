"use client";

import { useState } from "react";

import { getCauseOfDeath } from "@/lib/causeOfDeath";
import ShareModal from "@/app/components/ShareModal";
import type { BillRow } from "@/types/db";

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function fmtDate(dateStr: string | null) {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PARTY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  R: { bg: "#7f1d1d", text: "#fca5a5", border: "#dc2626", label: "Republican" },
  D: { bg: "#1e3a5f", text: "#93c5fd", border: "#3b82f6", label: "Democrat" },
  I: { bg: "#1c1c1c", text: "#d1d5db", border: "#6b7280", label: "Independent" },
};

function PartyBadge({ party }: { party: string | null }) {
  if (!party) return null;
  const s = PARTY_STYLES[party] ?? PARTY_STYLES["I"];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-semibold border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}

function DaysBadge({ date }: { date: string | null }) {
  const days = daysSince(date);
  if (days === null) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-bold whitespace-nowrap"
      style={{ background: "#1c1f24", border: "1px solid #f5c518", color: "#f5c518" }}
    >
      {days.toLocaleString()} days
    </span>
  );
}

function SponsorLink({ bill, name }: { bill: BillRow; name: string }) {
  const id   = bill.sponsor_bioguide_id;
  const href = id ? `/rep/${id}` : "#";
  return (
    <a href={href} className="text-sm font-medium hover:underline transition-colors" style={{ color: "#60a5fa" }}>
      {name}
    </a>
  );
}

function ShareButton({ bill }: { bill: BillRow }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs transition-colors px-3 py-1 rounded"
        style={{ color: "#8b9198", border: "1px solid #30363d", background: "none", cursor: "pointer" }}
      >
        Share
      </button>
      {open && <ShareModal bill={bill} onClose={() => setOpen(false)} />}
    </>
  );
}

export default function BillCard({ bill }: { bill: BillRow }) {
  const cause       = getCauseOfDeath(bill);
  const sponsorName = (bill.sponsor_name ?? "Unknown Sponsor").replace(/^(Rep\.|Sen\.)\s/, "");
  const district    = bill.sponsor_district ? `${bill.sponsor_district}` : "";

  return (
    <article
      className="rounded overflow-hidden flex flex-col"
      style={{ background: "#161b22", border: "1px solid #30363d", borderLeft: "3px solid #dc2626" }}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="sr-only">Bill</span>
            
              <a href={bill.legislation_url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm font-bold hover:underline transition-colors"
              style={{ color: "#dc2626" }}
            >
              {bill.bill_type.toUpperCase()} {bill.number}
            </a>
          </div>
          <DaysBadge date={bill.latest_action_date} />
        </div>

        <h2 className="text-base font-semibold leading-snug" style={{ color: "#e6edf3" }}>
          {bill.title.length > 110 ? bill.title.slice(0, 108) + "…" : bill.title}
        </h2>

        <div
          className="rounded px-3 py-2.5"
          style={{ background: "#0d1117", border: "1px solid #30363d" }}
        >
          <p className="text-sm font-bold" style={{ color: "#dc2626" }}>{cause.verdict}</p>
          <p className="mt-0.5 text-sm leading-snug" style={{ color: "#8b9198" }}>{cause.detail}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <PartyBadge party={bill.sponsor_party} />
          <SponsorLink bill={bill} name={sponsorName} />
          {bill.sponsor_state && (
            <span className="text-sm" style={{ color: "#8b9198" }}>
              {bill.sponsor_state}{district}
            </span>
          )}
        </div>

        <div
          className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2"
          style={{ borderTop: "1px solid #30363d" }}
        >
          <div className="text-sm" style={{ color: "#8b9198" }}>
            Introduced{" "}
            <span className="font-medium" style={{ color: "#e6edf3" }}>{fmtDate(bill.introduced_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            {bill.policy_area && (
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: "#21262d", color: "#8b9198" }}
              >
                {bill.policy_area}
              </span>
            )}
            <ShareButton bill={bill} />
          </div>
        </div>
      </div>
    </article>
  );
}
