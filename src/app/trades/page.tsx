'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'
import { getSupabase } from '@/lib/supabaseClient'
import type { Trade } from '@/lib/types'

export default function TradesPage() {
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

      if (error) setError(error.message)
      setTrades((data ?? []) as Trade[])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <RequireAuth>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Trades</h1>
            <p className="text-sm text-gray-700">Full list.</p>
          </div>
          <Link className="rounded-md bg-blue-600 px-4 py-2 text-white" href="/trades/new">
            + New trade
          </Link>
        </div>

        <div className="mt-6 rounded-lg border bg-white">
          {loading ? (
            <div className="p-4 text-sm text-gray-600">Loading…</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-700">{error}</div>
          ) : trades.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No trades yet.</div>
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
                    <span>{t.direction}</span>
                    <span>Setup: {t.setup ?? '—'}</span>
                    <span>Tags: {(t.tags ?? []).join(', ') || '—'}</span>
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
