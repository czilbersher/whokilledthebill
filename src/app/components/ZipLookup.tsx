"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ZipLookup() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLookup() {
    if (zip.length !== 5 || isNaN(Number(zip))) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.zippopotam.us/us/${zip}`
      );
      if (!res.ok) {
        setError("ZIP code not found. Please try another.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const state = data.places[0]["state abbreviation"];
      window.location.href = `/?state=${encodeURIComponent(state)}`;
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
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
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
          {loading ? "Looking up…" : "Find my rep →"}
        </button>
      </div>
      {error && (
        <div style={{ fontSize: "13px", color: "#f87171" }}>{error}</div>
      )}
      <div style={{ fontSize: "12px", color: "#8b9198" }}>
        See every bill your representative introduced — and let die.
      </div>
    </div>
  );
}