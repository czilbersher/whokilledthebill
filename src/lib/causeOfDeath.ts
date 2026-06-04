import type { BillRow } from "@/types/db";

export interface Cause {
  verdict: string;   // short label: "Died in Committee"
  detail: string;    // one editorial line for the card
}

export function getCauseOfDeath(bill: BillRow): Cause {
  const text  = bill.latest_action_text ?? "";
  const lower = text.toLowerCase();

  // Senate pattern: "Read twice and referred to the Committee on X"
  if (lower.includes("read twice and referred")) {
    const m = text.match(/Committee on ([^,.]+)/i);
    const c = m?.[1]?.trim() ?? "committee";
    return {
      verdict: "Died in Senate Committee",
      detail:  `Referred to the ${c} Committee — no vote taken`,
    };
  }

  // Subcommittee burial
  if (lower.includes("subcommittee")) {
    const m = text.match(/Subcommittee on ([^,.]+)/i);
    const c = m?.[1]?.trim();
    return {
      verdict: "Buried in Subcommittee",
      detail:  c ? `Sent to the ${c} Subcommittee — never resurfaced` : "Referred to subcommittee — never resurfaced",
    };
  }

  // Standard committee referral — extract committee name for specificity
  if (lower.includes("referred to")) {
    const m =
      text.match(/Committee on ([^,.]+)/i) ??
      text.match(/the ([A-Z][A-Za-z ,&-]+?) Committee/);
    const c = m?.[1]?.trim();
    return {
      verdict: "Died in Committee",
      detail:  c
        ? `Referred to the ${c} Committee — no hearing, no vote`
        : "Referred to committee — no hearing, no vote",
    };
  }

  return {
    verdict: "Legislative Abandonment",
    detail:  "Introduced, then quietly forgotten by its own sponsor",
  };
}
