import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="border-b border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/this-week" className="text-sm font-semibold text-slate-800">
          🍽 Meal Planner
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/this-week" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            This week
          </Link>
          <Link href="/plans" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            Past weeks
          </Link>
          <Link href="/settings" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  )
}