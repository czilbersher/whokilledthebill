interface HeroProps {
  totalBills: number;
  abandonedBills: number;
}

export default function Hero({ totalBills, abandonedBills }: HeroProps) {
  return (
    <header>
      {/* Crime tape */}
      <div
        className="w-full py-1.5 text-center text-xs font-black tracking-widest"
        style={{ background: "#f5c518", color: "#000" }}
      >
        ⚠ CRIME SCENE — U.S. CONGRESS — 119TH SESSION — DO NOT IGNORE ⚠
      </div>

      {/* Masthead */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #30363d" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Flag + congress identifier */}
          <div className="flex items-center gap-2 mb-5">
            <svg width="28" height="20" viewBox="0 0 28 20" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="20" fill="#B22234"/>
              <rect y="2.85" width="28" height="2.86" fill="#fff"/>
              <rect y="8.57" width="28" height="2.86" fill="#fff"/>
              <rect y="14.28" width="28" height="2.86" fill="#fff"/>
              <rect width="12" height="10" fill="#3C3B6E"/>
            </svg>
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "#8b9198" }}
            >
              119th United States Congress · Official Legislative Record · Data: Congress.gov
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black tracking-tight mb-3"
            style={{ fontSize: "clamp(36px, 6vw, 64px)", color: "#fff", lineHeight: 1.05 }}
          >
            Who Killed the <span style={{ color: "#dc2626" }}>Bill?</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base mb-2 max-w-2xl leading-relaxed" style={{ color: "#8b9198" }}>
            Your elected officials introduced {totalBills.toLocaleString()} pieces of legislation.
            Every single one was buried in committee — referred, forgotten, and never heard from again.
            No vote was held. No hearing was scheduled. No explanation was given.
          </p>

          {/* Not a bug line */}
          <p className="text-base font-semibold mb-8" style={{ color: "#f5c518" }}>
            ⚠ No, this isn&#39;t a bug. That&#39;s the point.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8 max-w-2xl">
            <div
              className="rounded-lg p-4"
              style={{ background: "#161b22", border: "1px solid #30363d" }}
            >
              <div
                className="font-black mb-1"
                style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "#fff", lineHeight: 1 }}
              >
                {totalBills.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: "#8b9198" }}>
                Bills introduced
              </div>
            </div>
            <div
              className="rounded-lg p-4"
              style={{ background: "#161b22", border: "1px solid #30363d" }}
            >
              <div
                className="font-black mb-1"
                style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "#dc2626", lineHeight: 1 }}
              >
                0
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: "#8b9198" }}>
                Received a hearing
              </div>
            </div>
            <div
              className="rounded-lg p-4"
              style={{ background: "#161b22", border: "1px solid #30363d" }}
            >
              <div
                className="font-black mb-1"
                style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "#dc2626", lineHeight: 1 }}
              >
                518
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: "#8b9198" }}>
                Days, longest cold case
              </div>
            </div>
          </div>

          {/* Editorial context */}
          <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "#8b9198" }}>
            These are the promises made to voters and the committees where they went to die.
            Search by sponsor, party, policy area, or how long the bill has been ignored.
          </p>

        </div>
      </div>
    </header>
  );
}