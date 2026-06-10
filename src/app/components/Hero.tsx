import { Suspense } from "react";
import Link from "next/link";
import ZipLookup from "@/app/components/ZipLookup";

interface HeroProps {
  totalBills: number;
  abandonedBills: number;
}

const POLICY_BUTTONS = [
  { label: "Healthcare", value: "Health" },
  { label: "Housing", value: "Housing and Community Development" },
  { label: "Education", value: "Education" },
  { label: "Environment", value: "Environmental Protection" },
  { label: "Economy", value: "Economics and Public Finance" },
  { label: "Veterans", value: "Armed Forces and National Security" },
];

export default function Hero({ totalBills, abandonedBills }: HeroProps) {
  return (
    <header>
      <div
        className="w-full py-1.5 text-center text-xs font-black tracking-widest"
        style={{ background: "#f5c518", color: "#000" }}
      >
        &#9888; CRIME SCENE &#8212; U.S. CONGRESS &#8212; 119TH SESSION &#8212; DO NOT IGNORE &#9888;
      </div>

      <div style={{ background: "#0d1117" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="flex items-center gap-2 mb-5">
            <svg width="28" height="20" viewBox="0 0 28 20" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="20" fill="#B22234"/>
              <rect y="2.85" width="28" height="2.86" fill="#fff"/>
              <rect y="8.57" width="28" height="2.86" fill="#fff"/>
              <rect y="14.28" width="28" height="2.86" fill="#fff"/>
              <rect width="12" height="10" fill="#3C3B6E"/>
            </svg>
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "#8b9198" }}
            >
              119th United States Congress · Official Legislative Record · Data: Congress.gov
            </span>
          </div>

          <h1
            className="font-black tracking-tight mb-3"
            style={{ fontSize: "clamp(36px, 6vw, 64px)", color: "#fff", lineHeight: 1.05 }}
          >
            Who Killed the <span style={{ color: "#dc2626" }}>Bill?</span>
          </h1>

          <p className="mb-2 max-w-2xl" style={{ color: "#c9d1d9", fontSize: "20px" }}>
            Your elected officials introduced {totalBills.toLocaleString()} pieces of legislation.
            Every single one was buried in committee — referred, forgotten, and never heard from again.
            No vote was held. No hearing was scheduled. No explanation was given.
          </p>

          <p className="text-base font-semibold mb-8" style={{ color: "#f5c518" }}>
            &#9888; No, this isn&#39;t a bug. That&#39;s the point.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8 max-w-2xl">
            <div className="rounded-lg p-4" style={{ background: "#161b22", border: "1px solid #30363d" }}>
              <div className="font-black mb-1" style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "#fff", lineHeight: 1 }}>
                {totalBills.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: "#8b9198" }}>
                Bills introduced
              </div>
            </div>
            <div className="rounded-lg p-4" style={{ background: "#161b22", border: "1px solid #30363d" }}>
              <div className="font-black mb-1" style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "#dc2626", lineHeight: 1 }}>
                0
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: "#8b9198" }}>
                Received a hearing
              </div>
            </div>
            <div className="rounded-lg p-4" style={{ background: "#161b22", border: "1px solid #30363d" }}>
              <div className="font-black mb-1" style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "#dc2626", lineHeight: 1 }}>
                518
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: "#8b9198" }}>
                Days, longest cold case
              </div>
            </div>
          </div>

          <p className="max-w-2xl leading-relaxed" style={{ color: "#8b9198", fontSize: "15px", marginBottom: "1.25rem" }}>
            These are the promises made to voters and the committees where they went to die.
            Search by sponsor, party, policy area, or how long the bill has been ignored.
          </p>

          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "11px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.625rem" }}>
              Browse by issue
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {POLICY_BUTTONS.map((btn) => (
                <Link
                  key={btn.value}
                  href={"/?policy=" + encodeURIComponent(btn.value)}
                  style={{
                    display: "inline-block",
                    padding: "6px 14px",
                    background: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "border-color 0.15s",
                  }}
                >
                  {btn.label}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <Suspense fallback={null}>
              <ZipLookup />
            </Suspense>
          </div>

        </div>
      </div>
    </header>
  );
}