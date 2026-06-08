"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington D.C.",
};

export default function ZipLookup() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeState = searchParams.get("state")?.toUpperCase() ?? "";
  const activeStateName = activeState ? (STATE_NAMES[activeState] ?? activeState) : "";

  async function handleLookup() {
    if (zip.length !== 5 || isNaN(Number(zip))) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!res.ok) {
        setError("ZIP code not found. Please try another.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const state = data.places[0]["state abbreviation"];
      router.push(`/?state=${encodeURIComponent(state)}`);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "480px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={zip}
          onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          onKeyDown={e => e.key === "Enter" && handleLookup()}
          placeholder="Enter your ZIP code"
          maxLength={5}
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: "15px",
            border: "1px solid #30363d",
            borderRadius: "6px",
            background: "#161b22",
            color: "#e6edf3",
            outline: "none",
          }}
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Looking up..." : "Find my rep"}
        </button>
      </div>
      {error && (
        <div style={{ fontSize: "13px", color: "#f87171" }}>{error}</div>
      )}
      {activeStateName && !error && (
        <div style={{ background: "#F9F3EE", border: "1px solid #DDC9B4", borderRadius: "6px", padding: "10px 14px", fontSize: "14px", color: "#111", lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: "#dc2626" }}>Showing abandoned bills from {activeStateName}.</span> These are the promises your representatives made — and abandoned.
        </div>
      )}
      {!activeStateName && !error && (
        <div style={{ fontSize: "12px", color: "#8b9198" }}>
          See every bill your representative introduced — and let die.
        </div>
      )}
    </div>
  );
}