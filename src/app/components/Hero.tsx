interface HeroProps {
  totalBills: number;
  abandonedBills: number;
}

export default function Hero({ totalBills, abandonedBills }: HeroProps) {
  const pct = totalBills > 0 ? Math.round((abandonedBills / totalBills) * 100) : 0;

  return (
    <section className="relative w-full overflow-hidden bg-[#08090d]">

      {/* Architectural top rule */}
      <div className="flex items-center gap-4 px-6 pt-8 sm:px-12">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-600">
          119TH CONGRESS · EST. JAN 3, 2025
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Site name */}
      <div className="mt-10 px-6 text-center sm:px-12">
        <p className="font-mono text-xs tracking-[0.4em] text-zinc-600 uppercase">
          A public-interest accountability project
        </p>
        <h1 className="mt-3 font-serif text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Who Killed the Bill?
        </h1>
      </div>

      {/* The big stat */}
      <div className="mt-12 px-6 text-center sm:px-12">
        <div className="inline-block">
          <p className="font-mono text-xs tracking-[0.35em] text-zinc-500 uppercase mb-2">
            Bills abandoned in committee
          </p>
          <div
            className="font-black text-white leading-none"
            style={{ fontSize: "clamp(80px, 18vw, 200px)", fontFamily: "Georgia, serif" }}
          >
            {abandonedBills.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-red-900" />
            <p className="font-mono text-sm text-red-500 tracking-widest uppercase">
              {pct}% of all bills introduced
            </p>
            <div className="h-px w-16 bg-red-900" />
          </div>
        </div>
      </div>

      {/* Editorial statement */}
      <div className="mx-auto mt-10 max-w-2xl px-6 text-center sm:px-12">
        <p className="font-serif text-lg leading-relaxed text-zinc-400 sm:text-xl">
          No hearing. No vote. No explanation.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Every bill below was introduced by an elected member of Congress —
          then abandoned without a single public action. These are the promises
          made to voters, and the committees where they went to die.
        </p>
      </div>

      {/* Stat strip */}
      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 divide-x divide-zinc-800 border-y border-zinc-800">
        <StatCell
          value={totalBills.toLocaleString()}
          label="Bills Introduced"
        />
        <StatCell
          value={abandonedBills.toLocaleString()}
          label="Died in Committee"
          red
        />
        <StatCell
          value={`${pct}%`}
          label="Abandonment Rate"
          red
        />
      </div>

      {/* Scroll prompt */}
      <div className="mt-8 pb-10 text-center">
        <p className="font-mono text-xs tracking-widest text-zinc-700 uppercase">
          Scroll to search the graveyard
        </p>
        <div className="mt-2 animate-bounce text-zinc-700">↓</div>
      </div>

      {/* Bottom fog gradient into content */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent" />
    </section>
  );
}

function StatCell({ value, label, red }: { value: string; label: string; red?: boolean }) {
  return (
    <div className="bg-[#08090d] px-4 py-5 text-center sm:px-8">
      <div className={`text-2xl font-black sm:text-3xl ${red ? "text-red-500" : "text-white"}`}>
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
        {label}
      </div>
    </div>
  );
}
