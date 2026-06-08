"use client";

import { useState } from "react";

export default function ZipLookup() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string } | null>(null);

  async function handleLookup() {
    if (zip.length !== 5 || isNaN(Number(zip))) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY;
      const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${zip}&levels=country&roles=legislatorUpperBody&roles=legislatorLowerBody&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        setError(`API error: ${data.error.message}`);
        setLoading(false);
        return;
      }

      if (!data.officials || data.officials.length === 0) {
        setError("No representatives found for that ZIP code. Try another.");
        setLoading(false);
        return;
      }

      const name = data.officials[0].name;
      setResult({ name });
      window.location.href = `/?rep=${encodeURIComponent(name)}`;

    } catch (err) {
      setError(`Error: ${String(err)}`);
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
          {loading ? "Looking up..." : "Find my rep →"}
        </button>
      </div>
      {error && (
        <div style={{ fontSize: "13px", color: "#f87171" }}>{error}</div>
      )}
      {result && (
        <div style={{ background: "#F9F3EE", border: "1px solid #DDC9B4", borderRadius: "6px", padding: "10px 14px", fontSize: "14px", color: "#111", lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: "#dc2626" }}>Your representative is {result.name}.</span> They introduced bills in the 119th Congress. Every one died in committee. No hearing. No vote. No explanation.
        </div>
      )}
      {!result && !error && (
        <div style={{ fontSize: "12px", color: "#8b9198" }}>
          See every bill your representative introduced — and let die.
        </div>
      )}
    </div>
  );
}