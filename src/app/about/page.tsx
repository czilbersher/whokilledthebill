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
        <p
          className="text-lg leading-relaxed mb-8"
          style={{ color: "#c9d1d9" }}
        >
          Most Americans assume that when a bill dies in Congress, it lost a
          vote. It did not. It was never given one.
        </p>

        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: "#8b9198" }}
        >
          The United States Congress introduces thousands of pieces of
          legislation every session. The vast majority never receive a hearing,
          a markup, or a floor vote. They are referred to committee and never
          heard from again. No explanation is given. No accountability is
          required. The elected officials who introduced them move on, often
          running for reelection on the very promises those buried bills were
          meant to keep.
        </p>

        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: "#8b9198" }}
        >
          This site was built on a simple belief: democracy requires
          transparency, and transparency requires tools. Every American deserves
          to know what their representative introduced, where it went, and how
          long it has been sitting in silence.
        </p>

        <h2
          className="text-xl font-bold mt-10 mb-4"
          style={{ color: "#e6edf3" }}
        >
          Who Built This
        </h2>

        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: "#8b9198" }}
        >
          My name is Curt Zilbersher. I am a civic technologist and independent
          researcher based in Weymouth, Massachusetts. Over a 25-year career
          designing data-driven platforms and information systems for
          organizations including Analog Devices, Deloitte, GE Capital, Philips,
          and BNSF Railway, I developed a deep appreciation for what good data
          architecture can reveal and what its absence conceals. I built this
          site as a private citizen who got tired of opacity and decided to do
          something about it.
        </p>

        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: "#8b9198" }}
        >
          I am not a lobbyist. I am not affiliated with any political party,
          PAC, or advocacy organization. The data powering this site comes
          entirely from Congress.gov, the official database of the United States
          Congress, maintained by the Library of Congress. Every bill, every
          sponsor, every committee referral, every date is sourced directly from
          that official record. The government created the data. I just made it
          impossible to ignore.
        </p>

        <h2
          className="text-xl font-bold mt-10 mb-4"
          style={{ color: "#e6edf3" }}
        >
          A Note on Nonpartisanship
        </h2>

        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: "#8b9198" }}
        >
          This site does not take sides. Republican bills are here. Democratic
          bills are here. Independent bills are here. The leaderboard does not
          favor one party. The filters do not hide one chamber. If your
          representative buried legislation, regardless of their party, you will
          find it here. Accountability is not a partisan issue. It is a civic
          one.
        </p>

        <h2
          className="text-xl font-bold mt-10 mb-4"
          style={{ color: "#e6edf3" }}
        >
          The Technology
        </h2>

        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: "#8b9198" }}
        >
          Who Killed the Bill? is built on Next.js, Supabase, and the
          Congress.gov API. It tracks every bill introduced in the 119th
          Congress (January 2025 to January 2027) that was referred to committee
          and received no hearing, no markup, and no recorded vote. Bills are
          classified as abandoned after 180 days of inactivity following
          committee referral. A full description of the methodology is available
          on the{" "}
          <Link href="/methodology" style={{ color: "#dc2626" }}>
            Methodology page
          </Link>
          .
        </p>

        <h2
          className="text-xl font-bold mt-10 mb-4"
          style={{ color: "#e6edf3" }}
        >
          Press Inquiries
        </h2>

        <p
          className="text-base leading-relaxed mb-4"
          style={{ color: "#8b9198" }}
        >
          Journalists and researchers are welcome to use this data. For
          methodology questions, data requests, or press inquiries, contact:
        </p>

        <p className="text-base font-medium mb-2" style={{ color: "#e6edf3" }}>
          Curt Zilbersher
        </p>
        <p className="text-base mb-10" style={{ color: "#8b9198" }}>
          press@whokilledthebill.com
        </p>
      </div>
    </main>
  );
}