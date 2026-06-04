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

function sponsorDisplay(bill: BillRow) {
  if (!bill.sponsor_name) return "Unknown Sponsor";
  return bill.sponsor_name.replace(/^(Rep\.|Sen\.)\s/, "");
}

const PARTY_COLOR: Record<string, string> = {
  R: "bg-red-950 text-red-400 border-red-900",
  D: "bg-blue-950 text-blue-400 border-blue-900",
  I: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

const PARTY_LABEL: Record<string, string> = {
  R: "Republican",
  D: "Democrat",
  I: "Independent",
};

export default function BillCard({ bill }: { bill: BillRow }) {
  const cause  = getCauseOfDeath(bill);
  const days   = daysSince(bill.latest_action_date);
  const party  = bill.sponsor_party ?? "?";
  const badgeClass = PARTY_COLOR[party] ?? PARTY_COLOR["I"];

  const daysColor =
    (days ?? 0) > 730  ? "text-red-400"    :
    (days ?? 0) > 365  ? "text-orange-400" :
                         "text-yellow-500";

  return (
    <article
      className="relative flex flex-col bg-zinc-900 border border-zinc-800 overflow-hidden
                 transition-transform duration-200 hover:-translate-y-0.5 hover:border-zinc-700"
      style={{ borderRadius: "40% 40% 4px 4px / 8% 8% 4px 4px" }}
    >
      {/* Tombstone arch cap */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-2 px-5">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-zinc-700 text-xs tracking-widest font-mono">R·I·P</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* "Here lies" + bill number */}
      <div className="text-center px-5 pb-1">
        <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-600 uppercase">Here lies</p>
        <a
          href={bill.legislation_url ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-lg font-bold text-zinc-200 hover:text-white transition-colors"
        >
          {bill.bill_type.toUpperCase()} {bill.number}
        </a>
      </div>

      {/* Title */}
      <div className="px-5 pb-4 text-center">
        <h2
          className="font-serif text-sm font-bold leading-snug text-zinc-100"
          style={{ fontFamily: "Georgia, serif" }}
          title={bill.title}
        >
          {bill.title.length > 90 ? bill.title.slice(0, 88) + "…" : bill.title}
        </h2>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-zinc-800" />

      {/* Born / Died */}
      <div className="grid grid-cols-2 divide-x divide-zinc-800 mx-0 mt-0">
        <div className="px-5 py-3 text-center">
          <p className="font-mono text-[9px] tracking-widest text-zinc-600 uppercase mb-0.5">Born</p>
          <p className="font-mono text-xs text-zinc-400">{fmt(bill.introduced_date)}</p>
        </div>
        <div className="px-5 py-3 text-center">
          <p className="font-mono text-[9px] tracking-widest text-zinc-600 uppercase mb-0.5">Last Seen</p>
          <p className="font-mono text-xs text-zinc-400">{fmt(bill.latest_action_date)}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-zinc-800" />

      {/* Cause of death */}
      <div className="px-5 py-4">
        <p className="font-mono text-[9px] tracking-[0.3em] text-red-800 uppercase mb-1">
          ◆ Cause of Death
        </p>
        <p className="font-bold text-red-400 text-sm leading-tight mb-1">{cause.verdict}</p>
        <p className="text-zinc-500 text-xs leading-snug">{cause.detail}</p>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-zinc-800" />

      {/* Sponsor */}
      <div className="px-5 py-3 flex items-start gap-2">
        <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded border text-[9px] font-bold tracking-wide flex-shrink-0 ${badgeClass}`}>
          {PARTY_LABEL[party] ?? party}
        </span>
        <div>
          <p className="text-zinc-300 text-xs font-semibold leading-tight">{sponsorDisplay(bill)}</p>
          {bill.sponsor_state && (
            <p className="text-zinc-600 text-[10px] font-mono">
              {bill.sponsor_state}{bill.sponsor_district ? `-${bill.sponsor_district}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Days counter — the gut punch */}
      <div className="flex-1" />
      <div className="mx-5 border-t border-zinc-800" />
      <div className="px-5 py-4 text-center">
        <span className={`font-black font-mono text-3xl ${daysColor}`}>
          {days !== null ? days.toLocaleString() : "—"}
        </span>
        <p className="font-mono text-[9px] tracking-[0.3em] text-zinc-600 uppercase mt-0.5">
          Days Abandoned
        </p>
      </div>

      {/* Policy area chip */}
      {bill.policy_area && (
        <div className="px-5 pb-3 text-center">
          <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[9px] font-mono tracking-wide">
            {bill.policy_area}
          </span>
        </div>
      )}

      {/* Card footer watermark */}
      <div className="mx-5 mb-4 border-t border-zinc-800 pt-3 flex items-center justify-between">
        <span className="font-mono text-[8px] tracking-widest text-zinc-700 uppercase">
          whokilledthebill.com
        </span>
        <span className="font-mono text-[8px] text-zinc-700">
          {bill.congress}th Congress
        </span>
      </div>
    </article>
  );
}
