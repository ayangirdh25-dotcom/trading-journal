'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { RequireAuth } from '@/components/RequireAuth'
import { getSupabase } from '@/lib/supabaseClient'
import type { Trade, TradeScreenshot } from '@/lib/types'

type ShotWithUrl = TradeScreenshot & { url: string | null }

export default function TradeDetailPage() {
  const params = useParams<{ id: string }>()
  const tradeId = params?.id

  const [trade, setTrade] = useState<Trade | null>(null)
  const [shots, setShots] = useState<ShotWithUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tradeId) return

    async function load() {
      setLoading(true)
      setError(null)

      const supabase = getSupabase()

      const { data: t, error: tErr } = await supabase.from('trades').select('*').eq('id', tradeId).maybeSingle()
      if (tErr) {
        setError(tErr.message)
        setLoading(false)
        return
      }
      setTrade((t ?? null) as Trade | null)

      const { data: s, error: sErr } = await supabase
        .from('trade_screenshots')
        .select('*')
        .eq('trade_id', tradeId)
        .order('created_at', { ascending: true })

      if (sErr) {
        setError(sErr.message)
        setLoading(false)
        return
      }

      const rows = (s ?? []) as TradeScreenshot[]
      const withUrls: ShotWithUrl[] = []

      for (const r of rows) {
        // Private bucket → signed URL
        const { data } = await supabase.storage.from('trade-screenshots').createSignedUrl(r.path, 60 * 60)
        withUrls.push({ ...r, url: data?.signedUrl ?? null })
      }

      setShots(withUrls)
      setLoading(false)
    }

    load()
  }, [tradeId])

  const title = useMemo(() => {
    if (!trade) return 'Trade'
    return `${trade.symbol} (${trade.market})`
  }, [trade])

  return (
    <RequireAuth>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm text-gray-600">
              <Link className="text-blue-700 hover:underline" href="/trades">
                Trades
              </Link>
              <span className="mx-2">/</span>
              <span>{title}</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
          </div>
          <Link className="rounded-md bg-blue-600 px-4 py-2 text-white" href="/trades/new">
            + New trade
          </Link>
        </div>

        {loading ? <div className="mt-6 text-sm text-gray-600">Loading…</div> : null}
        {error ? <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

        {!loading && !error && trade ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <div className="font-medium">Details</div>
              <div className="mt-2 grid gap-2 text-sm text-gray-700">
                <div>
                  <span className="text-gray-500">Direction:</span> {trade.direction}
                </div>
                <div>
                  <span className="text-gray-500">Setup:</span> {trade.setup ?? '—'}
                </div>
                <div>
                  <span className="text-gray-500">Tags:</span> {(trade.tags ?? []).join(', ') || '—'}
                </div>
                <div>
                  <span className="text-gray-500">PnL:</span> {(trade.pnl ?? 0).toFixed(2)}
                </div>
                <div>
                  <span className="text-gray-500">R:</span> {(trade.r_multiple ?? 0).toFixed(2)}
                </div>
                <div>
                  <span className="text-gray-500">Notes:</span>
                  <div className="mt-1 whitespace-pre-wrap rounded-md border bg-gray-50 p-2">{trade.notes ?? '—'}</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Screenshots</div>
                <div className="text-xs text-gray-500">(private)</div>
              </div>

              {shots.length === 0 ? (
                <div className="mt-3 text-sm text-gray-600">No screenshots.</div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {shots.map((s) => (
                    <a
                      key={s.id}
                      href={s.url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-lg border bg-gray-50"
                      title={s.caption ?? 'Screenshot'}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.url ?? ''} alt="screenshot" className="h-32 w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </RequireAuth>
  )
}
