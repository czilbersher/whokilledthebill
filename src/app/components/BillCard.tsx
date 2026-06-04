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

function SponsorLink({ bill, name }: { bill: BillRow; name: string }) {
  const id = bill.sponsor_bioguide_id;
  const href = id ? `/rep/${id}` : "#";
  return (
    <a href={href} className="text-sm text-gray-800 font-medium hover:text-red-600 hover:underline transition-colors">
      {name}
    </a>
  );
}

function ShareButton({ bill }: { bill: BillRow }) {
  const days = daysSince(bill.latest_action_date) ?? 0;
  const title = bill.title.length > 80 ? bill.title.slice(0, 80) + "…" : bill.title;
  const text = `"${title}" — abandoned for ${days} days. No hearing. No vote.`;
  const url = bill.legislation_url ?? "https://whokilledthebill.com";
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  return (
    <a href={tweet} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-black transition-colors">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      