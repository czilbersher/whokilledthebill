"use client";

import { useState } from "react";
import type { BillRow } from "@/types/db";

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export default function ShareModal({ bill, onClose }: { bill: BillRow; onClose: () => void }) {
  const days = daysSince(bill.latest_action_date) ?? 0;
  const title = bill.title.length > 80 ? bill.title.slice(0, 80) + "…" : bill.title;
  const sponsor = bill.sponsor_name ?? "Unknown Sponsor";
  const committee = bill.latest_action_text ?? "committee";
  const billId = `${bill.bill_type?.toUpperCase()} ${bill.number}`;

  const shareText = `${billId} — abandoned for ${days} days. No hearing. No vote. Who killed it? whokilledthebill.com`;
  const shareUrl = `https://whokilledthebill.com`;

  const platforms = [
    {
      name: "X / Twitter",
      color: "#000000",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
          "_blank"
        );
      },
    },
    {
      name: "Threads",
      color: "#000000",
      action: () => {
        window.open(
          `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`,
          "_blank"
        );
      },
    },
    {
      name: "LinkedIn",
      color: "#0077b5",
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
          "_blank"
        );
      },
    },
    {
      name: "Email",
      color: "#dc2626",
      action: () => {
        window.open(
          `mailto:?subject=${encodeURIComponent("You need to see this")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
          "_blank"
        );
      },
    },
    {
      name: "Copy link",
      color: "#1a3a6b",
      action: () => {
        navigator.clipboard.writeText(shareText + " " + shareUrl);
        alert("Copied to clipboard!");
      },
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "1.5rem",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "#dc2626", textTransform: "uppercase", marginBottom: "4px" }}>
              Cold Case — 119th Congress
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#111", lineHeight: 1.4 }}>
              {title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888", marginLeft: "1rem", flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        <div style={{ background: "#F9F3EE", border: "1px solid #DDC9B4", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>
            <span style={{ fontWeight: 600, color: "#dc2626" }}>{billId}</span> was introduced by <span style={{ fontWeight: 600 }}>{sponsor}</span> and has been abandoned for <span style={{ fontWeight: 600, color: "#dc2626" }}>{days} days</span>. No hearing. No vote. No explanation.
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "#888", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Share this cold case
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {platforms.map((p) => (
            <button
              key={p.name}
              onClick={p.action}
              style={{
                background: p.color,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}