"use client";

import { useRouter, useSearchParams } from "next/navigation";

const POLICY_BUTTONS = [
  { label: "Healthcare", value: "Health" },
  { label: "Housing", value: "Housing and Community Development" },
  { label: "Education", value: "Education" },
  { label: "Environment", value: "Environmental Protection" },
  { label: "Economy", value: "Economics and Public Finance" },
  { label: "Veterans", value: "Armed Forces and National Security" },
];

export default function PolicyButtons() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activePolicy = searchParams.get("policy") ?? "";

  function handleClick(value: string) {
    if (activePolicy === value) {
      router.push("/");
    } else {
      router.push("/?policy=" + encodeURIComponent(value));
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem", flexWrap: "wrap" }}>
        <p style={{ fontSize: "11px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          Most abandoned policy areas
        </p>
        {activePolicy && (
          <button
            onClick={() => router.push("/")}
            style={{ fontSize: "11px", color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
          >
            Clear filter
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {POLICY_BUTTONS.map((btn) => {
          const isActive = activePolicy === btn.value;
          return (
            <button
              key={btn.value}
              onClick={() => handleClick(btn.value)}
              style={{
                display: "inline-block",
                padding: "6px 14px",
                background: isActive ? "#dc2626" : "#161b22",
                border: isActive ? "1px solid #dc2626" : "1px solid #30363d",
                borderRadius: "6px",
                color: isActive ? "#fff" : "#c9d1d9",
                fontSize: "13px",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#8b9198";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363d";
                  (e.currentTarget as HTMLButtonElement).style.color = "#c9d1d9";
                }
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}