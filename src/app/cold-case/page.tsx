import { createServerSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { BillRow } from "@/types/db";

export const dynamic = "force-dynamic";

function daysSince(d: string | null) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

function fmt(dateStr: string | null) {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

const PARTY_LABELS: Record<string, string> = {
  R: "Republican", D: "Democrat", I: "Independent",
};

const PARTY_COLORS: Record<string, string> = {
  R: "#dc2626", D: "#3b82f6", I: "#6b7280",
};

async function generateNarrative(bill: BillRow, days: number): Promise<string> {
  const sponsorRaw = bill.sponsor_name ?? "";
  const nameNoTitle = sponsorRaw.replace(/\s*\[.*?\]\s*/g, "").replace(/^(Rep\.|Sen\.|Del\.)\s*/i, "").trim();
  const nameParts = nameNoTitle.split(",");
  const sponsorName = nameParts.length === 2
    ? nameParts[1].trim() + " " + nameParts[0].trim()
    : nameNoTitle;

  const prompt = `You are writing dramatic, punchy copy for a civic accountability website called WhoKilledTheBill.com. The site tracks bills that were introduced in Congress, referred to committee, and then buried without a hearing, vote, or explanation.

Write a "Cold Case File" narrative for the following bill. The tone should be like a true crime cold case report — serious, specific, and outraged on behalf of citizens. Do NOT use flowery language. Do NOT use em dashes. Keep sentences short and punchy. Write in plain English that any American can understand.

The narrative should have exactly four short paragraphs:
1. What the bill would have done and who it would have helped (2-3 sentences)
2. What happened to it — introduced, referred to committee, and then silence (2-3 sentences, include the exact number of days ignored)
3. Why this matters — the human cost of inaction (2-3 sentences)
4. A closing line asking who killed this bill

Bill details:
- Title: ${bill.title}
- Bill type and number: ${bill.bill_type?.toUpperCase()} ${bill.number}
- Sponsor: ${sponsorName}, ${PARTY_LABELS[bill.sponsor_party ?? "I"] ?? bill.sponsor_party} from ${bill.sponsor_state}
- Policy area: ${bill.policy_area ?? "Unknown"}
- Introduced: ${fmt(bill.introduced_date)}
- Days ignored: ${days}
- Last recorded action: ${bill.latest_action_text ?? "Referred to committee"}

Write only the four paragraphs. No headers. No bullet points. No title. Just the narrative.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return "API error " + response.status + ": " + JSON.stringify(data);
    }
    return data.content?.[0]?.text ?? "Narrative unavailable.";
  } catch (err) {
    console.error("Narrative generation failed:", err);
    return "Narrative unavailable: " + String(err);
  }
}

export default async function ColdCasePage() {
  const supabase = createServerSupabaseClient();

  const { data: coldCase } = await supabase
    .from("cold_cases")
    .select("*")
    .eq("is_current", true)
    .limit(1)
    .single() as any;

  const slug = coldCase.bill_slug as string;
  const parts = slug.split("-");
  const billType = parts[0];
  const number = parts.slice(1).join("-");

  const { data: billData } = await supabase
    .from("bills")
    .select("*")
    .eq("bill_type", billType)
    .eq("number", number)
    .limit(1);

  if (!billData || billData.length === 0) return notFound();

  const bill = billData[0] as BillRow;
  const days = daysSince(bill.latest_action_date);
  const partyKey = bill.sponsor_party ?? "I";
  const partyLabel = PARTY_LABELS[partyKey] ?? partyKey;
  const partyColor = PARTY_COLORS[partyKey] ?? "#6b7280";

  const sponsorRaw = bill.sponsor_name ?? "";
  const nameNoTitle = sponsorRaw.replace(/\s*\[.*?\]\s*/g, "").replace(/^(Rep\.|Sen\.|Del\.)\s*/i, "").trim();
  const nameParts = nameNoTitle.split(",");
  const sponsorName = nameParts.length === 2
    ? nameParts[1].trim() + " " + nameParts[0].trim()
    : nameNoTitle;

  const narrative = await generateNarrative(bill, days);

  const tweetText = encodeURIComponent(
    "Cold Case: " + bill.bill_type?.toUpperCase() + " " + bill.number + " was abandoned for " + days + " days. No hearing. No vote. Who killed it? whokilledthebill.com/cold-case"
  );
  const tweetHref = "https://twitter.com/intent/tweet?text=" + tweetText;

  return (
    <div style={{ backgroundColor: "#0d1117", minHeight: "100vh", fontFamily: "monospace" }}>

      <div style={{ borderBottom: "1px solid #30363d" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ color: "#e6edf3", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            &#8592; Back to all bills
          </Link>
          <a href={tweetHref} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "#000", color: "#fff", fontSize: "13px", fontWeight: 600, borderRadius: "6px", textDecoration: "none", border: "0.5px solid #30363d" }}>
            Share on X
          </a>
        </div>
      </div>

      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "2rem 1.5rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <div style={{ color: "#dc2626", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            &#9888; Cold Case File &#8212; Week of {new Date(coldCase.featured_week).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
          <h1 style={{ color: "#e6edf3", fontSize: "22px", fontWeight: 700, lineHeight: 1.4, margin: "0 0 0.5rem 0" }}>
            {bill.title}
          </h1>
          <div style={{ color: "#8b9198", fontSize: "13px" }}>
            {bill.bill_type?.toUpperCase()} {bill.number} &bull; {partyLabel} &bull; {bill.sponsor_state} &bull; {bill.policy_area}
          </div>
        </div>

        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderLeft: "4px solid #dc2626", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Introduced</div>
            <div style={{ fontSize: "14px", color: "#e6edf3", fontWeight: 600 }}>{fmt(bill.introduced_date)}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Days Ignored</div>
            <div style={{ fontSize: "14px", color: "#dc2626", fontWeight: 700 }}>{days.toLocaleString()} days</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Chamber</div>
            <div style={{ fontSize: "14px", color: "#e6edf3", fontWeight: 600 }}>{bill.origin_chamber ?? "Unknown"}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
            <div style={{ fontSize: "14px", color: "#e6edf3", fontWeight: 600 }}>Died in Committee</div>
          </div>
        </div>

        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
            &#128269; Case Narrative
          </div>
          {narrative.split("\n\n").map((para, i) => (
            <p key={i} style={{ color: "#c9d1d9", fontSize: "15px", lineHeight: 1.8, margin: "0 0 1rem 0" }}>
              {para}
            </p>
          ))}
        </div>

        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "11px", color: "#8b9198", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Sponsor</div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {bill.sponsor_bioguide_id && (
              <img
                src={"https://bioguide.congress.gov/bioguide/photo/" + bill.sponsor_bioguide_id[0] + "/" + bill.sponsor_bioguide_id + ".jpg"}
                alt={sponsorName}
                width={48}
                height={58}
                style={{ borderRadius: "4px", objectFit: "cover", border: "1px solid #30363d" }}
              />
            )}
            <div>
              {bill.sponsor_bioguide_id ? (
                <Link href={"/rep/" + bill.sponsor_bioguide_id} style={{ fontSize: "16px", fontWeight: 700, color: partyColor, textDecoration: "none" }}>
                  {sponsorName}
                </Link>
              ) : (
                <span style={{ fontSize: "16px", fontWeight: 700, color: partyColor }}>{sponsorName}</span>
              )}
              <div style={{ fontSize: "13px", color: "#8b9198", marginTop: "2px" }}>
                {partyLabel} {bill.sponsor_state ? "- " + bill.sponsor_state : ""}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {bill.legislation_url && (
            <a href={bill.legislation_url} target="_blank" rel="noreferrer" style={{ fontSize: "13px", color: "#58a6ff", textDecoration: "underline" }}>
              View on Congress.gov
            </a>
          )}
          <Link href="/leaderboard" style={{ fontSize: "13px", color: "#58a6ff", textDecoration: "underline" }}>
            See the full leaderboard
          </Link>
        </div>

      </div>
    </div>
  );
}
