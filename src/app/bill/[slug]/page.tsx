import { createClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [billType, ...rest] = slug.split("-");
  const number = rest.join("-");

  const supabase = createClient();
  const { data: bills } = await supabase
    .from("bills")
    .select("*")
    .ilike("bill_type", billType)
    .eq("number", number)
    .limit(1);

  const bill = bills?.[0];
  if (!bill) return { title: "Bill Not Found | Who Killed the Bill?" };

  return {
    title: `${bill.title} | Who Killed the Bill?`,
    description: `${bill.sponsor_name} introduced this bill on ${bill.introduced_date}. It was referred to committee and never heard from again. No hearing. No vote. No explanation.`,
  };
}

function daysSince(date: string | null): number | null {
  if (!date) return null;
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / 86_400_000
  );
}

export default async function BillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [billType, ...rest] = slug.split("-");
  const number = rest.join("-");

  const supabase = createClient();
  const { data: bills } = await supabase
    .from("bills")
    .select("*")
    .ilike("bill_type", billType)
    .eq("number", number)
    .limit(1);

  const bill = bills?.[0];
  if (!bill) notFound();

  const days = daysSince(bill.introduced_date);
  const chamber = bill.origin_chamber === "Senate" ? "Senate" : "House";
  const partyColor =
    bill.sponsor_party === "R"
      ? "#dc2626"
      : bill.sponsor_party === "D"
      ? "#3b82f6"
      : "#6b7280";
  const partyLabel =
    bill.sponsor_party === "R"
      ? "Republican"
      : bill.sponsor_party === "D"
      ? "Democrat"
      : "Independent";

  const shareText = `${bill.title} was introduced ${days} days ago. No hearing. No vote. No explanation. whokilledthebill.com/bill/${slug}`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#0d1117" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        <div className="mb-8">
          <Link
            href="/"
            style={{ color: "#8b9198", fontSize: "14px" }}
            className="hover:underline"
          >
            ← Back to all bills
          </Link>
        </div>

        <div
          style={{
            borderLeft: "4px solid #dc2626",
            paddingLeft: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#dc2626",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            {bill.bill_type.toUpperCase()} {bill.number} · 119th Congress · {chamber}
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#e6edf3",
              lineHeight: 1.25,
              marginBottom: "1rem",
            }}
          >
            {bill.title}
          </h1>
        </div>

        <div
          style={{
            backgroundColor: "#161b22",
            borderLeft: "3px solid #dc2626",
            borderRadius: "0 8px 8px 0",
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#dc2626",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.375rem",
            }}
          >
            Died in Committee
          </div>
          <div style={{ fontSize: "14px", color: "#8b9198" }}>
            {bill.latest_action_text || "Referred to committee — no hearing, no vote"}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#161b22",
              borderRadius: "8px",
              padding: "1rem",
              border: "0.5px solid #30363d",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#8b9198",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.25rem",
              }}
            >
              Days Ignored
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#f5c518",
              }}
            >
              {days?.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#161b22",
              borderRadius: "8px",
              padding: "1rem",
              border: "0.5px solid #30363d",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#8b9198",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.25rem",
              }}
            >
              Introduced
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#e6edf3",
              }}
            >
              {bill.introduced_date}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#161b22",
              borderRadius: "8px",
              padding: "1rem",
              border: "0.5px solid #30363d",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#8b9198",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.25rem",
              }}
            >
              Policy Area
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#e6edf3",
              }}
            >
              {bill.policy_area || "Uncategorized"}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#161b22",
            borderRadius: "8px",
            padding: "1.25rem",
            border: "0.5px solid #30363d",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#8b9198",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.75rem",
            }}
          >
            Sponsor
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              style={{
                backgroundColor: partyColor,
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                padding: "2px 10px",
                borderRadius: "4px",
              }}
            >
              {partyLabel}
            </span>
            {bill.sponsor_bioguide_id ? (
              <Link
                href={`/rep/${bill.sponsor_bioguide_id}`}
                style={{
                  color: "#e6edf3",
                  fontSize: "16px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                {bill.sponsor_name}
              </Link>
            ) : (
              <span style={{ color: "#e6edf3", fontSize: "16px", fontWeight: 600 }}>
                {bill.sponsor_name}
              </span>
            )}
            <span style={{ color: "#8b9198", fontSize: "14px" }}>
              {bill.sponsor_state}
              {bill.sponsor_district ? `-${bill.sponsor_district}` : ""}
            </span>
          </div>
        </div>

        {bill.legislation_url && (
          <div style={{ marginBottom: "2rem" }}>
            
              href={bill.legislation_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#8b9198",
                fontSize: "13px",
                textDecoration: "none",
              }}
              className="hover:underline"
            >
        View official record on Congress.gov
            </a>
          </div>
        )}

        <div
          style={{
            borderTop: "0.5px solid #30363d",
            paddingTop: "2rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
              padding: "0.625rem 1.25rem",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Share on X
          </a>
          <Link
            href="/"
            style={{
              backgroundColor: "#161b22",
              color: "#e6edf3",
              padding: "0.625rem 1.25rem",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              border: "0.5px solid #30363d",
            }}
          >
            See all 9,799 abandoned bills
          </Link>
        </div>

      </div>
    </main>
  );
}