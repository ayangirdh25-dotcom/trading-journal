'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [nextPath, setNextPath] = useState('/dashboard')

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // Read ?next=... from the URL (client-side)
    const params = new URLSearchParams(window.location.search)
    const n = params.get('next')
    if (n) setNextPath(n)
  }, [])

  useEffect(() => {
    if (user) router.replace(nextPath)
  }, [user, router, nextPath])

  async function sendOtp() {
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      const redirectTo = `${window.location.origin}${nextPath}`
      const { error } = await getSupabase().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) throw error
      setStatus('OTP link sent. Check your email (Inbox/Spam) and open the link on your phone or PC.')
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send OTP')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-gray-700">
        OTP (magic link) login. We’ll email you a sign-in link. Your data stays private via Supabase Row Level Security.
      </p>

      <div className="mt-6 grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Email</span>
          <input
            className="rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
          />
        </label>

        {status ? <div className="rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-900">{status}</div> : null}
        {error ? <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">{error}</div> : null}

        <button
          onClick={sendOtp}
          disabled={busy || !email}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {busy ? 'Sending…' : 'Send OTP link'}
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-600">
        Tip: If the link opens in your phone, you’ll be logged in there too.
      </div>
    </main>
  )
}
