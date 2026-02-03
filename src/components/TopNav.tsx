'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export function TopNav() {
  const { user, signOut } = useAuth()

  return (
    <div className="w-full border-b bg-white/60 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-semibold">
            Trading Journal
          </Link>
          <Link href="/trades/new" className="text-sm text-blue-700 hover:underline">
            + New trade
          </Link>
          <Link href="/trades" className="text-sm text-blue-700 hover:underline">
            Trades
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-gray-600 sm:inline">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-blue-700 hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
