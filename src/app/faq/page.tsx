"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "Why did 100% of bills die in committee?",
    a: "The 119th Congress is still active — these bills haven't been voted on yet, but they've been sitting without any action for 180 or more days. In practice, the vast majority of bills introduced in any Congress never receive a hearing or a vote. Leadership controls which bills get scheduled, and most bills are introduced for messaging purposes rather than with any expectation of passage.",
  },
  {
    q: "Is this site biased against one party?",
    a: "No. The data shows what it shows — bills from both Republicans and Democrats are tracked equally. You can filter by party on the homepage and see the breakdown for yourself. The abandonment problem is bipartisan: members of both parties introduce bills that never receive hearings or votes.",
  },
  {
    q: "What counts as an 'abandoned' bill?",
    a: "A bill is considered abandoned if its only recorded actions are introduction and committee referral, with no subsequent hearing, markup, or floor vote for 180 or more days. This definition comes directly from the bill's action history as recorded in the Congress.gov API.",
  },
  {
    q: "Where does the data come from?",
    a: "All data is sourced from the official Congress.gov API, maintained by the Library of Congress. This is the same data source used by researchers, journalists, and government agencies. We update our database regularly.",
  },
  {
    q: "Isn't it normal for most bills to die in committee?",
    a: "Yes — it is normal, and that's exactly the point. The fact that 100% of introduced legislation dies without a hearing or vote is not a bug in the system, it's a feature of how Congress operates. This site exists to make that process visible and to let voters see exactly which bills their representatives introduced and then abandoned.",
  },
  {
    q: "Can a bill still pass after being listed here?",
    a: "Yes. If a bill receives a hearing, markup, or floor vote after being listed, it would no longer meet our definition of abandoned. We update our data regularly, but there may be a short lag between congressional action and our database reflecting it.",
  },
  {
    q: "Who built this?",
    a: "Who Killed the Bill? is an independent public-interest project. It is not affiliated with any political party, government agency, or advocacy organization. The site was built to make legislative accountability data accessible to everyone.",
  },
  {
    q: "How do I report an error in the data?",
    a: "If you believe a bill has been incorrectly categorized or that our data contains an error, the underlying source is the Congress.gov API. You can verify any bill directly at congress.gov by searching the bill number.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex items-start justify-between gap-4 hover:text-red-600 transition-colors"
      >
        <span className="text-base font-semibold text-gray-900">{q}</span>
        <span className="text-gray-400 text-xl mt-0.5 shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="pb-5 text-sm text-gray-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-sm text-red-600 hover:text-red-800 font-medium">
            ← Back to all bills
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500 mb-10">Answers to common questions about this project and the data behind it.</p>

        <div className="bg-white rounded-md border border-gray-200 px-6 shadow-sm">
          {FAQS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
