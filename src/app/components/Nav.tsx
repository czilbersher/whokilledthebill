import Link from "next/link";

export default function Nav() {
  return (
    <header className="bg-white border-b-2 border-[#1a3a6b] sticky top-0 z-50" style={{ borderTop: "3px solid #dc2626" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="12" cy="7" rx="2" ry="3" fill="#1a3a6b"/>
              <rect x="10" y="9.5" width="4" height="1.5" fill="#1a3a6b"/>
              <rect x="5" y="11" width="14" height="1.5" fill="#1a3a6b"/>
              <rect x="3" y="12.5" width="18" height="2" fill="#1a3a6b"/>
              <rect x="6" y="14.5" width="2" height="4" fill="#1a3a6b"/>
              <rect x="11" y="14.5" width="2" height="4" fill="#1a3a6b"/>
              <rect x="16" y="14.5" width="2" height="4" fill="#1a3a6b"/>
              <rect x="3" y="18.5" width="18" height="1.5" fill="#1a3a6b"/>
            </svg>
            <span className="font-mono text-sm font-bold text-gray-900 tracking-tight">
              Who Killed the Bill?
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Leaderboard
            </Link>
            <Link href="/faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
            <Link href="/methodology" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Methodology
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
