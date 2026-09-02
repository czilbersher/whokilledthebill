import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { lastUpdatedLabel } from "@/lib/lastUpdated";

export const revalidate = 3600;

export const metadata = {
  title: "Methodology | Who Killed the Bill?",
  description:
    "How we define an abandoned bill, where the data comes from (the official Congress.gov API), and how often it is refreshed.",
  openGraph: { title: "Methodology | Who Killed the Bill?", description: "How we define an abandoned bill, where the data comes from (the official Congress.gov API), and how often it is refreshed.", type: "website" },
};

export default async function MethodologyPage() {
  const supabase = createServerSupabaseClient();
  const lastUpdated = await lastUpdatedLabel(supabase);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Methodology</h1>
        <p className="text-gray-500 mb-2">How we define abandonment, where the data comes from, and what this site does and does not claim.</p>
        <p className="text-sm font-medium text-red-600 mb-10">Data last updated: {lastUpdated}</p>

        <div className="space-y-8">

          <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Data Source</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              All legislative data is sourced from the official Congress.gov API, maintained by the Library of Congress. This is the authoritative federal record of all legislation introduced in the United States Congress. We query the API for all bills introduced in the 119th Congress (January 3, 2025 through January 2027) and store the results in our database. The raw API is available at <a href="https://api.congress.gov" target="_blank" rel="noreferrer" className="text-red-600 underline">api.congress.gov</a>.
            </p>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Definition of Abandonment</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              A bill is classified as abandoned if all of the following are true:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 mb-3">
              <li className="flex gap-2">
                <span className="text-red-500 font-bold shrink-0">1.</span>
                The bill's only recorded actions are introduction and referral to committee.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 font-bold shrink-0">2.</span>
                No hearing, markup, or floor vote has been scheduled or held.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 font-bold shrink-0">3.</span>
                At least 180 days have passed since the bill's last recorded action.
              </li>
            </ul>
            <p className="text-sm text-gray-600 leading-relaxed">
              The 119th Congress remains active through January 2027. A bill currently classified as abandoned could receive action at any time. Our database is updated periodically and classifications may change as the congressional record is updated.
            </p>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">What This Site Does Not Claim</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              We make no claim about why any individual bill was not acted upon. There are many legitimate reasons a bill may not advance — lack of co-sponsors, supersession by broader legislation, changed political circumstances, or the sponsor's own decision to withdraw support. This site does not assign motive or fault to any individual member of Congress.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              What we do claim is that the bills listed here were introduced by elected officials, referred to committee, and received no further recorded action for at least 180 days. Voters can draw their own conclusions.
            </p>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Update Frequency</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our database is updated periodically from the Congress.gov API. There may be a short lag between congressional action and our data reflecting it. If you believe a bill has been incorrectly categorized, verify its current status directly at <a href="https://congress.gov" target="_blank" rel="noreferrer" className="text-red-600 underline">congress.gov</a>.
            </p>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Coverage</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              This site currently covers the 119th Congress only (January 3, 2025 through January 2027). We track both House and Senate bills. Resolutions, amendments, and other non-bill legislative actions are not included.
            </p>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Press and Data Requests</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Journalists and researchers are welcome to use this data. For methodology questions, data requests, or press inquiries, contact <a href="mailto:press@whokilledthebill.com" className="text-red-600 underline">press@whokilledthebill.com</a>. We are happy to provide data cuts by state, party, chamber, or policy area on request.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}