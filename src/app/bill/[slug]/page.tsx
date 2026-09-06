import { createServerSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { BillRow } from "@/types/db";
import LetterGenerator from "@/app/components/LetterGenerator";
import PhotoLightbox from "@/app/components/PhotoLightbox";
import { formatDate } from "@/lib/formatDate";

// 9,799 of these went into the sitemap on 2026-09-01 and Google started
// crawling all of them. With no caching directive each hit regenerated the
// page, which is where the usage spike came from. A day matches the nightly
// ingest: the underlying bill data cannot change more often than that.
export const revalidate = 86400;

const fmt = (dateStr: string | null) => formatDate(dateStr);

function daysSince(d: string | null) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

const PARTY_LABELS: Record<string, string> = {
  R: "Republican", D: "Democrat", I: "Independent",
};

const PARTY_COLORS: Record<string, string> = {
  R: "#dc2626", D: "#3b82f6", I: "#6b7280",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const parts = slug.split("-");
  const billType = parts[0];
  const number = parts.slice(1).join("-");

  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("bills")
    .select("title, bill_type, number, sponsor_name, latest_action_date")
    .eq("bill_type", billType)
    .eq("number", number)
    .limit(1);

  if (!data || data.length === 0) return {};

  const bill = data[0] as BillRow;

  const label = (bill.bill_type ?? "").toUpperCase() + " " + bill.number;
  const rawTitle = bill.title ?? "Untitled bill";
  const shortTitle = rawTitle.length > 90 ? rawTitle.slice(0, 87).trimEnd() + "..." : rawTitle;

  const rawName = bill.sponsor_name ?? "";
  const nameNoTitle = rawName.replace(/\s*\[.*?\]\s*/g, "").replace(/^(Rep\.|Sen\.|Del\.)\s*/i, "").trim();
  const nameParts = nameNoTitle.split(",");
  const sponsor = nameParts.length === 2 ? nameParts[1].trim() + " " + nameParts[0].trim() : nameNoTitle;

  const days = daysSince(bill.latest_action_date);

  const title = label + ": " + shortTitle + " | Who Killed the Bill?";
  const description =
    label + " was introduced" + (sponsor ? " by " + sponsor : "") +
    " and then left in committee for " + String(days) +
    " days. No hearing. No vote. No explanation.";

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}

export default async function BillPage({ params }: Props) {
  const { slug } = await params;

  const parts = slug.split("-");
  const billType = parts[0];
  const number = parts.slice(1).join("-");

  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("bills")
    .select("*")
    .eq("bill_type", billType)
    .eq("number", number)
    .limit(1);

  if (!data || data.length === 0) return notFound();

  const bill = data[0] as BillRow;
  const days = daysSince(bill.latest_action_date);
  const partyKey = bill.sponsor_party ?? "I";
  const partyLabel = PARTY_LABELS[partyKey] ?? partyKey;
  const partyColor = PARTY_COLORS[partyKey] ?? "#6b7280";

  const sponsorRaw = bill.sponsor_name ?? "";
  const nameNoTitle = sponsorRaw.replace(/\s*\[.*?\]\s*/g, "").replace(/^(Rep\.|Sen\.|Del\.)\s*/i, "").trim();
  const nameParts = nameNoTitle.split(",");
  const sponsorName = nameParts.length === 2 ? nameParts[1].trim() + " " + nameParts[0].trim() : nameNoTitle;

  const tweetText = encodeURIComponent(
    (bill.bill_type?.toUpperCase() ?? "") + " " + bill.number + " abandoned for " + days + " days. No hearing. No vote. whokilledthebill.com/bill/" + slug
  );
  const tweetHref = "https://twitter.com/intent/tweet?text=" + tweetText;

  return (
    <div style={{ backgroundColor: "#f8f8f6", minHeight: "100vh" }}>

      <div style={{ backgroundColor: "#0d1117", borderBottom: "1px solid #30363d" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ color: "#e6edf3", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            &#8592; Back to all bills
          </Link>
          <a href={tweetHref} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "#000", color: "#fff", fontSize: "13px", fontWeight: 600, borderRadius: "6px", textDecoration: "none", border: "0.5px solid #30363d" }}>
            Share on X
          </a>
        </div>
      </div>

      <div style={{ maxWidth: "48rem", margin: "2rem auto", padding: "0 1.5rem" }}>

        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderLeft: "4px solid #dc2626", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "#dc2626" }}>
              {bill.bill_type?.toUpperCase()} {bill.number}
            </span>
            <span style={{ backgroundColor: "#F9F3EE", border: "1px solid #DDC9B4", color: "#dc2626", fontSize: "13px", fontWeight: 700, padding: "4px 10px", borderRadius: "4px" }}>
              {days.toLocaleString()} days ignored
            </span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#e6edf3", lineHeight: 1.4, margin: "0 0 1rem 0" }}>
            {bill.title}
          </h1>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Introduced</div>
              <div style={{ fontSize: "14px", color: "#e6edf3", fontWeight: 600 }}>{fmt(bill.introduced_date)}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Chamber</div>
              <div style={{ fontSize: "14px", color: "#e6edf3", fontWeight: 600 }}>{bill.origin_chamber ?? "Unknown"}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Policy Area</div>
              <div style={{ fontSize: "14px", color: "#e6edf3", fontWeight: 600 }}>{bill.policy_area ?? "Unknown"}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#8b9198", textTransform: "uppercase", letterSpacing: "0.06em" }}>Last Action</div>
              <div style={{ fontSize: "14px", color: "#e6edf3", fontWeight: 600 }}>{fmt(bill.latest_action_date)}</div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#F9F3EE", border: "1px solid #DDC9B4", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626", margin: "0 0 4px 0" }}>Died in Committee</p>
          <p style={{ fontSize: "14px", color: "#92400e", margin: 0, lineHeight: 1.6 }}>
            {bill.latest_action_text ?? "Referred to committee with no further action recorded."}
          </p>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.75rem 0" }}>Sponsor</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {bill.sponsor_bioguide_id && (
              <PhotoLightbox
                src={"https://bioguide.congress.gov/bioguide/photo/" + bill.sponsor_bioguide_id[0] + "/" + bill.sponsor_bioguide_id + ".jpg"}
                alt={sponsorName}
                width={48}
                height={58}
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
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                {partyLabel} {bill.sponsor_state ? "- " + bill.sponsor_state : ""}
              </div>
            </div>
          </div>
        </div>

        <LetterGenerator
          billTitle={bill.title ?? ""}
          billType={bill.bill_type ?? ""}
          billNumber={bill.number ?? ""}
          sponsorName={sponsorName}
          sponsorState={bill.sponsor_state ?? ""}
          daysIgnored={days}
          latestActionText={bill.latest_action_text ?? ""}
        />

        {bill.legislation_url && (
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <a href={bill.legislation_url} target="_blank" rel="noreferrer" style={{ fontSize: "14px", color: "#6b7280", textDecoration: "underline" }}>
              View on Congress.gov
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
