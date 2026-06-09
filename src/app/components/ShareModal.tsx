"use client";

import { useState, useRef } from "react";
import type { BillRow } from "@/types/db";

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function generateCard(bill: BillRow, days: number): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, 1200, 630);

    // Red left stripe
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(0, 0, 8, 630);

    // Top label
    ctx.fillStyle = "#8b9198";
    ctx.font = "600 22px monospace";
    ctx.fillText("WHO KILLED THE BILL?", 60, 80);

    // Bill ID
    const billId = (bill.bill_type?.toUpperCase() ?? "") + " " + (bill.number ?? "");
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 28px monospace";
    ctx.fillText(billId, 60, 140);

    // Bill title -- wrap text
    ctx.fillStyle = "#e6edf3";
    ctx.font = "bold 38px sans-serif";
    const words = (bill.title ?? "").split(" ");
    let line = "";
    let y = 220;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 1080 && line !== "") {
        ctx.fillText(line.trim(), 60, y);
        line = word + " ";
        y += 52;
        if (y > 380) {
          ctx.fillText(line.trim() + "...", 60, y);
          break;
        }
      } else {
        line = test;
      }
    }
    if (y <= 380) ctx.fillText(line.trim(), 60, y);

    // Divider
    ctx.fillStyle = "#30363d";
    ctx.fillRect(60, 420, 1080, 1);

    // Days ignored
    ctx.fillStyle = "#f5c518";
    ctx.font = "900 72px sans-serif";
    ctx.fillText(days.toLocaleString(), 60, 520);
    ctx.fillStyle = "#8b9198";
    ctx.font = "500 24px sans-serif";
    ctx.fillText("DAYS IGNORED", 60, 555);

    // Sponsor
    const sponsorRaw = bill.sponsor_name ?? "";
    const sponsorClean = sponsorRaw.replace(/\s*\[.*?\]\s*/g, "").replace(/^(Rep\.|Sen\.|Del\.)\s*/i, "").trim();
    const sponsorParts = sponsorClean.split(",");
    const sponsorName = sponsorParts.length === 2 ? sponsorParts[1].trim() + " " + sponsorParts[0].trim() : sponsorClean;
    ctx.fillStyle = "#e6edf3";
    ctx.font = "500 26px sans-serif";
    ctx.fillText("Sponsor: " + sponsorName, 400, 520);

    // Party badge
    const party = bill.sponsor_party ?? "";
    const partyColor = party === "R" ? "#dc2626" : party === "D" ? "#3b82f6" : "#6b7280";
    const partyLabel = party === "R" ? "Republican" : party === "D" ? "Democrat" : "Independent";
    ctx.fillStyle = partyColor;
    ctx.font = "600 22px sans-serif";
    ctx.fillText(partyLabel, 400, 555);

    // Site URL
    ctx.fillStyle = "#8b9198";
    ctx.font = "500 22px monospace";
    ctx.fillText("whokilledthebill.com", 900, 555);

    resolve(canvas.toDataURL("image/png"));
  });
}

export default function ShareModal({ bill, onClose }: { bill: BillRow; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const days = daysSince(bill.latest_action_date) ?? 0;
  const title = bill.title.length > 80 ? bill.title.slice(0, 80) + "..." : bill.title;
  const sponsor = bill.sponsor_name ?? "Unknown Sponsor";
  const billId = (bill.bill_type?.toUpperCase() ?? "") + " " + bill.number;

  const shareText = billId + " abandoned for " + days + " days. No hearing. No vote. Who killed it? whokilledthebill.com";
  const shareUrl = "https://whokilledthebill.com";

  async function handleDownload() {
    setDownloading(true);
    const dataUrl = await generateCard(bill, days);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "whokilledthebill-" + bill.bill_type + "-" + bill.number + ".png";
    a.click();
    setDownloading(false);
  }

  const platforms = [
    {
      name: "X / Twitter",
      color: "#000000",
      action: () => window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText), "_blank"),
    },
    {
      name: "Threads",
      color: "#000000",
      action: () => window.open("https://www.threads.net/intent/post?text=" + encodeURIComponent(shareText), "_blank"),
    },
    {
      name: "LinkedIn",
      color: "#0077b5",
      action: () => window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(shareUrl) + "&summary=" + encodeURIComponent(shareText), "_blank"),
    },
    {
      name: "Email",
      color: "#dc2626",
      action: () => window.open("mailto:?subject=" + encodeURIComponent("You need to see this") + "&body=" + encodeURIComponent(shareText + "\n\n" + shareUrl), "_blank"),
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
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={onClose}
    >
      <div
       style={{ background: "#fff", borderRadius: "12px", padding: "1.5rem", maxWidth: "480px", width: "100%", boxShadow: "0 4px 32px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}
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
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888", marginLeft: "1rem", flexShrink: 0 }}>
            x
          </button>
        </div>

        <div style={{ background: "#F9F3EE", border: "1px solid #DDC9B4", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>
            <span style={{ fontWeight: 600, color: "#dc2626" }}>{billId}</span> was introduced by <span style={{ fontWeight: 600 }}>{sponsor}</span> and has been abandoned for <span style={{ fontWeight: 600, color: "#dc2626" }}>{days} days</span>. No hearing. No vote. No explanation.
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{ width: "100%", background: "#f5c518", color: "#000", border: "none", borderRadius: "8px", padding: "10px 16px", fontSize: "14px", fontWeight: 700, cursor: downloading ? "wait" : "pointer", marginBottom: "12px" }}
        >
          {downloading ? "Generating..." : "Download shareable image card"}
        </button>

        <div style={{ fontSize: "12px", color: "#888", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Share this cold case
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {platforms.map((p) => (
            <button
              key={p.name}
              onClick={p.action}
              style={{ background: p.color, color: "#fff", border: "none", borderRadius: "8px", padding: "10px 16px", fontSize: "14px", fontWeight: 500, cursor: "pointer", textAlign: "left" }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}