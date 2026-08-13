'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Join() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [myName, setMyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin() {
    if (!email.trim() || !myName.trim() || inviteCode.trim().length < 6 || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/couple/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inviteCode.trim(),
          myName: myName.trim(),
          email: email.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(
          data.error === 'Invalid code' ? 'Code not found — check it and try again'
          : data.error === 'Couple already full' ? 'This couple is already complete'
          : data.error === 'Email already registered' ? 'Email already registered'
          : data.error ?? 'Something went wrong'
        )
        return
      }
      router.push('/home')
    } catch {
      setError('Could not connect. Check your internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FBF8F4] flex flex-col px-6 pt-14 pb-8">
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-[#9B88C8] text-sm font-semibold block mb-6"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-[#2B3A4A]">Join with a code</h1>
          <p className="text-sm text-[#2B3A4A]/50 mt-1.5">
            Your partner shared a 6-character code with you.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-medium text-[#2B3A4A]/40 block mb-1.5">Your email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className="w-full h-14 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-base font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-[#2B3A4A]/40 block mb-1.5">Your name</label>
            <input
              type="text"
              value={myName}
              onChange={e => setMyName(e.target.value)}
              placeholder="e.g. James"
              autoComplete="given-name"
              className="w-full h-14 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-base font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-[#2B3A4A]/40 block mb-1.5">Invite code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="ABC123"
              maxLength={6}
              className="w-full h-14 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-3xl font-extrabold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors tracking-[0.25em] text-center"
            />
          </div>
        </div>

        {error && (
          <div className="space-y-2">
            <p className="text-red-500 text-sm font-medium">{error}</p>
            {error === 'Email already registered' && (
              <Link href="/signin" className="block text-sm font-semibold text-[#9B88C8]">
                Sign in instead →
              </Link>
            )}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={loading || !email.trim() || !myName.trim() || inviteCode.trim().length < 6}
          className="w-full h-14 rounded-2xl bg-[#C4B5E0] text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? 'Joining…' : 'Join our space'}
        </button>
      </div>
    </main>
  )
}
