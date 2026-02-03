import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 sm:p-10">
        <div className="text-xs font-medium tracking-wide text-gray-500">PRIVATE • MOBILE-FRIENDLY • PERFORMANCE-FOCUSED</div>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
          Trading Journal
          <span className="block text-gray-600">built to make you brutally consistent.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-gray-700">
          This isn’t a “dear diary”. It’s a feedback machine: log fast, review with evidence, and tighten your rules until your
          edge is measurable.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-md bg-blue-600 px-4 py-2 text-white" href="/dashboard">
            Open dashboard
          </Link>
          <Link className="rounded-md border px-4 py-2" href="/login">
            Login (OTP)
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Designed to work cleanly on phone so you can log immediately after the trade.
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="font-medium">1) Trade capture</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            <li>Market, symbol, direction</li>
            <li>Entry/exit, size, fees, PnL</li>
            <li>Setup + tags + notes</li>
          </ul>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="font-medium">2) Execution truth</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            <li>Rule breaks (comma list)</li>
            <li>Mood + sleep (context)</li>
            <li>Stops “storytelling” after losses</li>
          </ul>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="font-medium">3) Metrics that matter</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            <li>Win rate, total PnL</li>
            <li>Avg R multiple</li>
            <li>Recent trades snapshot</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 rounded-xl border bg-white p-4 sm:p-6">
        <div className="font-medium">What makes it “performance” focused?</div>
        <div className="mt-2 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <div>
            <div className="font-medium text-gray-900">Evidence over vibes</div>
            <p className="mt-1">If it’s not tracked, it doesn’t exist. The journal forces clarity: setup, risk, execution.</p>
          </div>
          <div>
            <div className="font-medium text-gray-900">Process over outcome</div>
            <p className="mt-1">A “good” trade can lose. A “bad” trade can win. We still score rule adherence.</p>
          </div>
          <div>
            <div className="font-medium text-gray-900">Fast loop</div>
            <p className="mt-1">Mobile-first so you log immediately and don’t rewrite history hours later.</p>
          </div>
          <div>
            <div className="font-medium text-gray-900">Privacy</div>
            <p className="mt-1">Login + per-user data isolation (Row Level Security) on the database.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <div>Next: deploy on Vercel (free) and use from phone.</div>
        <Link className="text-blue-700 hover:underline" href="/login">
          Get started →
        </Link>
      </div>
    </main>
  )
}
