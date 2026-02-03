import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Trading Journal</h1>
      <p className="mt-2 text-gray-700">
        Log trades fast. Review honestly. Improve.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-md bg-blue-600 px-4 py-2 text-white" href="/dashboard">
          Go to dashboard
        </Link>
        <Link className="rounded-md border px-4 py-2" href="/login">
          Login
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <div className="font-medium">What this focuses on</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            <li>Expectancy and R-multiples</li>
            <li>Setup quality + rule adherence</li>
            <li>Psychology triggers (tilt, sleep, mood)</li>
            <li>Weekly review loop</li>
          </ul>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="font-medium">Next steps</div>
          <ol className="mt-2 list-decimal pl-5 text-sm text-gray-700">
            <li>Create Supabase project + run schema</li>
            <li>Set env vars on Vercel</li>
            <li>Deploy and use from phone</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
