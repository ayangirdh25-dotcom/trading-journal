'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'
import { getSupabase } from '@/lib/supabaseClient'
import type { Trade } from '@/lib/types'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error } = await getSupabase()
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) setError(error.message)
      setTrades((data ?? []) as Trade[])
      setLoading(false)
    }
    load()
  }, [])

  const summary = useMemo(() => {
    const n = trades.length
    const pnlSum = trades.reduce((acc, t) => acc + (t.pnl ?? 0), 0)
    const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length
    const winRate = n ? (wins / n) * 100 : 0

    const rAvg = n
      ? trades.reduce((acc, t) => acc + (t.r_multiple ?? 0), 0) / n
      : 0

    return {
      n,
      pnlSum,
      winRate,
      rAvg,
    }
  }, [trades])

  return (
    <RequireAuth>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-700">Last 50 trades snapshot.</p>
          </div>
          <Link className="rounded-md bg-blue-600 px-4 py-2 text-white" href="/trades/new">
            + New trade
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Trades" value={String(summary.n)} />
          <Stat label="Win rate" value={`${summary.winRate.toFixed(1)}%`} />
          <Stat label="Avg R" value={summary.rAvg.toFixed(2)} />
          <Stat label="Total PnL" value={summary.pnlSum.toFixed(2)} />
        </div>

        <div className="mt-8 rounded-lg border bg-white">
          <div className="border-b px-4 py-3 font-medium">Recent trades</div>
          {loading ? (
            <div className="p-4 text-sm text-gray-600">Loading…</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-700">{error}</div>
          ) : trades.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No trades yet. Add your first one.</div>
          ) : (
            <div className="divide-y">
              {trades.map((t) => (
                <div key={t.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                      {t.symbol} <span className="text-sm text-gray-500">({t.market})</span>
                    </div>
                    <div className={(t.pnl ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}>
                      {(t.pnl ?? 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                    <span>Dir: {t.direction}</span>
                    <span>Setup: {t.setup ?? '—'}</span>
                    <span>R: {(t.r_multiple ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </RequireAuth>
  )
}
