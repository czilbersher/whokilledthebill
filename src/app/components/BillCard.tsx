"use client";

import { getCauseOfDeath } from "@/lib/causeOfDeath";
import type { BillRow } from "@/types/db";

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function fmt(dateStr: string | null) {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PARTY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  R: { bg: "bg-red-50",  text: "text-red-700",  border: "border-red-200",  label: "Republican"  },
  D: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Democrat"     },
  I: { bg: "bg-gray-100",text: "text-gray-600", border: "border-gray-300", label: "Independent"  },
};

function PartyBadge({ party }: { party: string | null }) {
  if (!party) return null;
  const s = PARTY_STYLES[party] ?? PARTY_STYLES["I"];
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

function DaysBadge({ date }: { date: string | null }) {
  const days = daysSince(date);
  if (days === null) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-700 text-sm font-bold whitespace-nowrap">
      {days.toLocaleString()} days
    </span>
  );
}

export default function BillCard({ bill }: { bill: BillRow }) {
  const cause       = getCauseOfDeath(bill);
  const sponsorName = (bill.sponsor_name ?? "Unknown Sponsor").replace(/^(Rep\.|Sen\.)\s/, "");
  const district    = bill.sponsor_district ? `-${bill.sponsor_district}` : "";

  return (
    <article
      className="bg-white rounded-md border border-gray-200 overflow-hidden
                 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ borderLeft: "4px solid #dc2626" }}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* ── Top row: bill number + days badge ─────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {/* The one graveyard accent — a small muted dagger */}
            <span className="text-gray-300 text-sm select-none" aria-hidden>†</span>
            <a
              href={bill.legislation_url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm font-bold text-gray-600 hover:text-red-600 transition-colors"
            >
              {bill.bill_type.toUpperCase()} {bill.number}
            </a>
          </div>
          <DaysBadge date={bill.latest_action_date} />
        </div>

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <h2 className="text-base font-semibold text-gray-900 leading-snug">
          {bill.title.length > 110 ? bill.title.slice(0, 108) + "…" : bill.title}
        </h2>

        {/* ── Cause of death ────────────────────────────────────────────── */}
        <div className="bg-red-50 border border-red-100 rounded px-3 py-2.5">
          <p className="text-sm font-bold text-red-700">{cause.verdict}</p>
          <p className="mt-0.5 text-sm text-red-600 leading-snug">{cause.detail}</p>
        </div>

        {/* ── Sponsor ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <PartyBadge party={bill.sponsor_party} />
         href={bill.sponsor_bioguide_id ? `/rep/${bill.sponsor_bioguide_id}` : "#"}
  className="text-sm text-gray-800 font-medium hover:text-red-600 hover:underline transition-colors"
>
  {sponsorName}
</a>
          {bill.sponsor_state && (
            <span className="text-sm text-gray-400">
              {bill.sponsor_state}{district}
            </span>
          )}
        </div>

        {/* ── Footer meta ───────────────────────────────────────────────── */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-gray-500">
            Introduced{" "}
            <span className="font-medium text-gray-700">{fmt(bill.introduced_date)}</span>
          </div>
          {bill.policy_area && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">
              {bill.policy_area}
            </span>
          )}
        </div>

      </div>
    </article>
  );
}
