import Link from "next/link";

export default function Nav() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-mono text-sm font-bold text-gray-900 hover:text-red-600 transition-colors tracking-tight">
            Who Killed the Bill?
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
