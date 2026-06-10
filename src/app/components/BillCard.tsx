"use client";

import { useState } from "react";
import Link from "next/link";
import type { BillRow } from "@/types/db";
import { getCauseOfDeath } from "@/lib/causeOfDeath";
import ShareModal from "./ShareModal";

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function DaysBadge({ date }: { date: string | null }) {
  const days = daysSince(date);
  if (days === null) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border text-sm font-bold whitespace-nowrap"
      style={{ backgroundColor: '#F9F3EE', borderColor: '#DDC9B4', color: '#dc2626' }}
    >
      {days.toLocaleString()} days
    </span>
  );
}

export default function BillCard({ bill }: { bill: BillRow }) {
  const [showShare, setShowShare] = useState(false);
  const cause = getCauseOfDeath(bill);

  const sponsorRaw = bill.sponsor_name ?? "";
  const nameNoTitle = sponsorRaw.replace(/\s*\[.*?\]\s*/g, "").replace(/^(Rep\.|Sen\.|Del\.)\s*/i, "").trim();
  const nameParts = nameNoTitle.split(",");
  const sponsorDisplay = nameParts.length === 2 ? nameParts[1].trim() + " " + nameParts[0].trim() : nameNoTitle;

  const partyColor = bill.sponsor_party === "R" ? "#dc2626" : bill.sponsor_party === "D" ? "#1a3a6b" : "#6b7280";

  const billSlug = (bill.bill_type?.toLowerCase() ?? "") + "-" + bill.number;

  const legislationUrl = bill.legislation_url ?? "#";

  return (
    <>
      <article
        className="rounded overflow-hidden flex flex-col"
        style={{ background: "#161b22", border: "1px solid #30363d", borderLeft: "4px solid #dc2626" }}
      >
        <div className="px-3 py-2.5">

          <div className="flex justify-between items-start gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="sr-only">Bill</span>
              <span className="font-mono text-sm font-bold" style={{ color: "#dc2626" }}>
                
                  href={legislationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                  style={{ color: "#dc2626" }}
                >
                  {bill.bill_type?.toUpperCase()} {bill.number}
                </a>
              </span>
            </div>
            <DaysBadge date={bill.latest_action_date} />
          </div>

          <Link href={"/bill/" + billSlug} className="hover:underline">
            <h2 className="text-sm font-semibold mb-1.5" style={{ color: "#e6edf3" }}>
              {bill.title.length > 110 ? bill.title.slice(0, 108) + "..." : bill.title}
            </h2>
          </Link>

          <div
            className="rounded px-3 py-2.5"
            style={{ background: "#0d1117", border: "1px solid #30363d" }}
          >
            <p className="text-sm font-bold" style={{ color: "#dc2626" }}>{cause.verdict}</p>
            <p className="mt-0.5 text-sm leading-snug" style={{ color: "#8b9198" }}>{cause.detail}</p>
          </div>

          <div className="mt-2 flex items-center justify-between flex-wrap gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {bill.sponsor_bioguide_id ? (
                <Link
                  href={"/rep/" + bill.sponsor_bioguide_id}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: partyColor }}
                >
                  {sponsorDisplay}
                </Link>
              ) : (
                <span className="text-xs font-semibold" style={{ color: partyColor }}>{sponsorDisplay}</span>
              )}
              {bill.sponsor_state && (
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: "#21262d", color: "#60a5fa" }}
                >
                  {bill.sponsor_state}
                </span>
              )}
              {bill.policy_area && (
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{ background: "#21262d", color: "#60a5fa" }}
                >
                  {bill.policy_area}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowShare(true)}
              className="inline-flex items-center gap-1 text-xs transition-colors px-3 py-1 rounded"
              style={{ background: "#21262d", color: "#8b9198", border: "1px solid #30363d" }}
            >
              Share
            </button>
          </div>

        </div>
      </article>
      {showShare && <ShareModal bill={bill} onClose={() => setShowShare(false)} />}
    </>
  );
}