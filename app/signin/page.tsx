'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn() {
    if (!email.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(
          data.error === 'No account found'
            ? 'No account found for this email. Start a new space or join with a code.'
            : data.error ?? 'Something went wrong'
        )
        setLoading(false)
        return
      }
      router.push('/home')
    } catch {
      setError('Could not connect. Check your internet.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FBF8F4] flex flex-col px-6 pt-14 pb-8">
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div>
          <button onClick={() => router.back()} className="text-[#9B88C8] text-sm font-semibold block mb-6">
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-[#2B3A4A]">Sign back in</h1>
          <p className="text-sm text-[#2B3A4A]/50 mt-1.5">
            Enter the email you used to create your space.
          </p>
        </div>

        <div>
          <label className="text-[10px] font-medium text-[#2B3A4A]/40 block mb-1.5">Your email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSignIn()}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            className="w-full h-14 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-base font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
          />
        </div>

        {error && (
          <div className="space-y-2">
            <p className="text-red-500 text-sm font-medium">{error}</p>
            {error.includes('No account') && (
              <div className="flex gap-3">
                <Link href="/create" className="flex-1 text-center h-11 rounded-xl border border-[#EDE8F5] text-[#9B88C8] font-semibold text-sm flex items-center justify-center">
                  Start a space
                </Link>
                <Link href="/join" className="flex-1 text-center h-11 rounded-xl border border-[#EDE8F5] text-[#9B88C8] font-semibold text-sm flex items-center justify-center">
                  Join with code
                </Link>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading || !email.trim()}
          className="w-full h-14 rounded-2xl bg-[#C4B5E0] text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </main>
  )
}
