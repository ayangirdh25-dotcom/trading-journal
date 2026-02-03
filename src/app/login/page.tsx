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
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
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

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      if (mode === 'signup') {
        const { error } = await getSupabase().auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await getSupabase().auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      router.replace(nextPath)
    } catch (e: any) {
      setError(e?.message ?? 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
      <p className="mt-2 text-sm text-gray-700">
        Private journal. Your data is protected by login + Supabase Row Level Security.
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
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Password</span>
          <input
            className="rounded-md border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
          />
        </label>

        {error ? <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">{error}</div> : null}

        <button
          onClick={submit}
          disabled={busy || !email || !password}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-sm text-blue-700 hover:underline"
        >
          {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-600">
        Tip: Use a strong password. If you want 2FA later, we can add it via Supabase Auth.
      </div>
    </main>
  )
}
