import Link from "next/link";

export const metadata = {
  title: "About | Who Killed the Bill?",
  description: "Who built this site, why it exists, and how to get in touch.",
};

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-3xl font-black tracking-tight mb-6"
        style={{ color: "#e6edf3" }}
      >
        About This Site
      </h1>
      <div className="max-w-none">
        <p className="text-lg leading-relaxed mb-6" style={{ color: "#c9d1d9" }}>
          Who Killed the Bill? is a public-interest project built and maintained
          by Curtis Zilbersher, an independent civic technologist based in the
          United States.
        </p>
        <p className="text-base leading-relaxed mb-6" style={{ color: "#8b9198" }}>
          This site tracks every bill introduced in the 119th Congress that was
          referred to committee and then abandoned — no hearing, no vote, no
          explanation. The data is sourced entirely from the official
          Congress.gov API, maintained by the Library of Congress.
        </p>
        <p className="text-base leading-relaxed mb-6" style={{ color: "#8b9198" }}>
          The goal is simple: to make the invisible visible. Most bills do not
          lose a vote. They never get one. This site exists to show voters
          exactly which legislation their elected officials introduced — and
          then quietly forgot.
        </p>
        <p className="text-base leading-relaxed mb-6" style={{ color: "#8b9198" }}>
          This is a nonpartisan project. Every member of Congress appears in
          this database regardless of party. The data does not editorialize —
          it simply shows what happened, and what did not.
        </p>
        <h2 className="text-xl font-bold mt-10 mb-4" style={{ color: "#e6edf3" }}>
          Press inquiries
        </h2>
        <p className="text-base leading-relaxed mb-4" style={{ color: "#8b9198" }}>
          Journalists and researchers are welcome to use this data. For
          methodology questions, data requests, or press inquiries, contact:
        </p>
        <p className="text-base font-medium mb-2" style={{ color: "#e6edf3" }}>
          Curtis Zilbersher
        </p>
        <p className="text-base mb-10" style={{ color: "#8b9198" }}>
          press@whokilledthebill.com
        </p>
        <h2 className="text-xl font-bold mt-10 mb-4" style={{ color: "#e6edf3" }}>
          Methodology
        </h2>
        <p className="text-base leading-relaxed" style={{ color: "#8b9198" }}>
          A bill is considered abandoned if its only recorded actions are
          introduction and referral to committee, with no subsequent hearing,
          markup, or floor vote for 180 or more days. For full methodology
          details, see the{" "}
          <Link href="/methodology" style={{ color: "#dc2626" }}>
            Methodology page
          </Link>
          .
        </p>
      </div>
    </main>
  );
}