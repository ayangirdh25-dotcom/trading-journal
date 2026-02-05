'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuth } from '@/components/AuthProvider'
import { getSupabase } from '@/lib/supabaseClient'

function toNum(v: string): number | null {
  if (!v.trim()) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default function NewTradePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [market, setMarket] = useState('crypto')
  const [symbol, setSymbol] = useState('')
  const [direction, setDirection] = useState<'long' | 'short'>('long')
  const [setup, setSetup] = useState('')
  const [tags, setTags] = useState('')

  const [entryPrice, setEntryPrice] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [size, setSize] = useState('')
  const [fees, setFees] = useState('')
  const [pnl, setPnl] = useState('')
  const [rMultiple, setRMultiple] = useState('')

  const [mood, setMood] = useState('3')
  const [sleepHours, setSleepHours] = useState('')
  const [ruleBreaks, setRuleBreaks] = useState('')
  const [notes, setNotes] = useState('')

  const [screenshots, setScreenshots] = useState<FileList | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const computedPnl = useMemo(() => {
    const ep = toNum(entryPrice)
    const xp = toNum(exitPrice)
    const s = toNum(size)
    const f = toNum(fees) ?? 0
    if (ep == null || xp == null || s == null) return null
    const raw = direction === 'long' ? (xp - ep) * s : (ep - xp) * s
    return raw - f
  }, [entryPrice, exitPrice, size, fees, direction])

  async function save() {
    if (!user) return
    setBusy(true)
    setError(null)
    setUploadError(null)

    const payload = {
      user_id: user.id,
      market,
      symbol: symbol.trim(),
      direction,
      setup: setup.trim() || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),

      entry_price: toNum(entryPrice),
      exit_price: toNum(exitPrice),
      size: toNum(size),
      fees: toNum(fees),

      pnl: toNum(pnl) ?? computedPnl,
      r_multiple: toNum(rMultiple),

      mood: toNum(mood),
      sleep_hours: toNum(sleepHours),
      rule_breaks: ruleBreaks
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim() || null,
    }

    try {
      const supabase = getSupabase()
      const { data: tradeRows, error: tradeErr } = await supabase
        .from('trades')
        .insert(payload)
        .select('id')

      if (tradeErr) throw tradeErr
      const tradeId = tradeRows?.[0]?.id as string | undefined
      if (!tradeId) throw new Error('Failed to get new trade id')

      // Upload screenshots (unlimited)
      if (screenshots && screenshots.length > 0) {
        for (const file of Array.from(screenshots)) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const objectPath = `${user.id}/${tradeId}/${Date.now()}-${safeName}`

          const { error: upErr } = await supabase.storage
            .from('trade-screenshots')
            .upload(objectPath, file, { upsert: false })

          if (upErr) throw upErr

          const { error: metaErr } = await supabase.from('trade_screenshots').insert({
            trade_id: tradeId,
            user_id: user.id,
            path: objectPath,
            caption: null,
          })
          if (metaErr) throw metaErr
        }
      }

      router.replace(`/trades/${tradeId}`)
    } catch (e: any) {
      // Separate upload errors for clarity
      const msg = e?.message ?? 'Failed to save'
      if (String(msg).toLowerCase().includes('storage') || String(msg).toLowerCase().includes('bucket')) {
        setUploadError(msg)
      } else {
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <RequireAuth>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold">New trade</h1>
        <p className="mt-1 text-sm text-gray-700">Log it while it’s fresh. Don’t rewrite history.</p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-3 rounded-lg border bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Market</span>
                <select className="rounded-md border px-3 py-2" value={market} onChange={(e) => setMarket(e.target.value)}>
                  <option value="crypto">crypto</option>
                  <option value="forex">forex</option>
                  <option value="stocks">stocks</option>
                  <option value="options">options</option>
                  <option value="futures">futures</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Symbol</span>
                <input className="rounded-md border px-3 py-2" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="BTCUSDT / EURUSD / AAPL" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Direction</span>
                <select className="rounded-md border px-3 py-2" value={direction} onChange={(e) => setDirection(e.target.value as any)}>
                  <option value="long">long</option>
                  <option value="short">short</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Setup</span>
                <input className="rounded-md border px-3 py-2" value={setup} onChange={(e) => setSetup(e.target.value)} placeholder="Breakout / Pullback / Mean reversion…" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Tags (comma separated)</span>
                <input className="rounded-md border px-3 py-2" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="A+, news, revenge-trade" />
              </label>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border bg-white p-4">
            <div className="font-medium">Numbers</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Entry price</span>
                <input className="rounded-md border px-3 py-2" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} inputMode="decimal" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Exit price</span>
                <input className="rounded-md border px-3 py-2" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} inputMode="decimal" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Size (units)</span>
                <input className="rounded-md border px-3 py-2" value={size} onChange={(e) => setSize(e.target.value)} inputMode="decimal" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Fees</span>
                <input className="rounded-md border px-3 py-2" value={fees} onChange={(e) => setFees(e.target.value)} inputMode="decimal" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">PnL (optional override)</span>
                <input className="rounded-md border px-3 py-2" value={pnl} onChange={(e) => setPnl(e.target.value)} inputMode="decimal" />
                <span className="text-xs text-gray-500">Auto estimate: {computedPnl == null ? '—' : computedPnl.toFixed(2)}</span>
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">R multiple</span>
                <input className="rounded-md border px-3 py-2" value={rMultiple} onChange={(e) => setRMultiple(e.target.value)} inputMode="decimal" placeholder="e.g. 1.5" />
              </label>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border bg-white p-4">
            <div className="font-medium">Screenshots (optional)</div>
            <div className="text-xs text-gray-600">Upload before/after charts. Stored privately (only your account can access).</div>
            <input
              className="rounded-md border bg-white px-3 py-2 text-sm"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setScreenshots(e.target.files)}
            />
            {screenshots ? (
              <div className="text-xs text-gray-600">Selected: {screenshots.length} file(s)</div>
            ) : null}
            {uploadError ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{uploadError}</div>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-lg border bg-white p-4">
            <div className="font-medium">Psychology + execution</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Mood (1–5)</span>
                <select className="rounded-md border px-3 py-2" value={mood} onChange={(e) => setMood(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Sleep hours</span>
                <input className="rounded-md border px-3 py-2" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} inputMode="decimal" />
              </label>
              <label className="grid gap-1 sm:col-span-2">
                <span className="text-sm text-gray-600">Rule breaks (comma separated)</span>
                <input className="rounded-md border px-3 py-2" value={ruleBreaks} onChange={(e) => setRuleBreaks(e.target.value)} placeholder="moved stop, over-leverage, FOMO" />
              </label>
              <label className="grid gap-1 sm:col-span-2">
                <span className="text-sm text-gray-600">Notes</span>
                <textarea className="min-h-28 rounded-md border px-3 py-2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What was the thesis? What did you do right/wrong?" />
              </label>
            </div>
          </div>

          {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

          <button
            onClick={save}
            disabled={busy || !symbol.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save trade'}
          </button>
        </div>
      </main>
    </RequireAuth>
  )
}
