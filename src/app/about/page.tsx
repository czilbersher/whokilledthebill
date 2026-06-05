export const metadata = {
  title: "About | Who Killed the Bill?",
  description: "Who built this site, why it exists, and how to get in touch.",
};

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-6">
        About This Site
      </h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Who Killed the Bill? is a public-interest project built and maintained
          by Curtis Zilbersher, an independent civic technologist based in the
          United States.
        </p>
        <p className="text-base text-gray-600 leading-relaxed mb-6">
          This site tracks every bill introduced in the 119th Congress that was
          referred to committee and then abandoned — no hearing, no vote, no
          explanation. The data is sourced entirely from the official
          Congress.gov API, maintained by the Library of Congress.
        </p>
        <p className="text-base text-gray-600 leading-relaxed mb-6">
          The goal is simple: to make the invisible visible. Most bills do not
          lose a vote. They never get one. This site exists to show voters
          exactly which legislation their elected officials introduced — and
          then quietly forgot.
        </p>
        <p className="text-base text-gray-600 leading-relaxed mb-6">
          This is a nonpartisan project. Every member of Congress appears in
          this database regardless of party. The data does not editorialize —
          it simply shows what happened, and what did not.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
          Press inquiries
        </h2>
        <p className="text-base text-gray-600 leading-relaxed mb-4">
          Journalists and researchers are welcome to use this data. For
          methodology questions, data requests, or press inquiries, contact:
        </p>
        <p className="text-base font-medium text-gray-900 mb-2">
          Curtis Zilbersher
        </p>
        <p className="text-base text-gray-600 mb-10">
          
            href="mailto:czilbersher@gmail.com"
            className="text-red-600 hover:underline"
          >
            czilbersher@gmail.com
          </a>
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
          Methodology
        </h2>
        <p className="text-base text-gray-600 leading-relaxed">
          A bill is considered abandoned if its only recorded actions are
          introduction and referral to committee, with no subsequent hearing,
          markup, or floor vote for 180 or more days. For full methodology
          details, see the{" "}
          <a href="/methodology" className="text-red-600 hover:underline">
            Methodology page
          </a>
          .
        </p>
      </div>
    </main>
  );
}