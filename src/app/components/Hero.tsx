interface HeroProps {
  totalBills: number;
  abandonedBills: number;
}

export default function Hero({ totalBills, abandonedBills }: HeroProps) {
  const pct = totalBills > 0 ? Math.round((abandonedBills / totalBills) * 100) : 0;

  return (
    <header>
      {/* Red cap — the one graveyard accent */}
      <div className="h-1 w-full bg-red-600" />

      {/* Masthead */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Who Killed the Bill?
            </h1>
            <p className="mt-1.5 text-base text-gray-500 max-w-xl leading-relaxed">
              U.S. federal legislation introduced by elected officials —
              then abandoned in committee without a vote or a hearing.
            </p>
          </div>
          <div className="text-xs text-gray-400 text-right leading-relaxed">
            119th Congress<br />
            Data: Congress.gov
          </div>
        </div>
      </div>

      {/* Hero stat block */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">

            {/* The number */}
            <div className="md:col-span-2">
              <div
                className="font-black text-gray-900 leading-none"
                style={{ fontSize: "clamp(72px, 10vw, 128px)" }}
              >
                {abandonedBills.toLocaleString()}
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-700">
                bills died in committee
              </p>
              <p className="mt-1 text-base text-red-600 font-medium">
                {pct}% of all 119th Congress legislation
              </p>
            </div>

            {/* Editorial context */}
            <div className="md:col-span-3 border-l-0 md:border-l md:border-gray-200 md:pl-12">
              <p className="text-lg text-gray-800 leading-relaxed">
                Every bill on this page was introduced by an elected member of Congress,
                referred to committee — and then quietly forgotten. No vote was held.
                No hearing was scheduled. No explanation was given.
              </p>
              <p className="mt-4 text-base text-gray-500 leading-relaxed">
                These are the promises made to voters and the committees where they went to die.
                Search by sponsor, party, policy area, or how long the bill has been ignored.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <StatCell value={totalBills.toLocaleString()} label="Bills introduced" />
            <StatCell value={abandonedBills.toLocaleString()} label="Died in committee" red />
            <StatCell value={`${pct}%`} label="Abandonment rate" red />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCell({
  value,
  label,
  red,
}: {
  value: string;
  label: string;
  red?: boolean;
}) {
  return (
    <div className="py-5 px-4 sm:px-6 text-center">
      <div className={`text-2xl sm:text-3xl font-black ${red ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </div>
      <div className="mt-1 text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
