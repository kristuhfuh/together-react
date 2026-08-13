'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OtpForm } from '@/components/OtpForm'

export default function Join() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [auth, setAuth] = useState<{ email: string; accessToken: string } | null>(null)
  const [myName, setMyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleVerified(email: string, accessToken: string) {
    setAuth({ email, accessToken })
    setStep('code')
  }

  async function handleJoin() {
    if (!myName.trim() || inviteCode.trim().length < 6 || !auth || loading) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/couple/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inviteCode.trim(),
          myName: myName.trim(),
          email: auth.email,
          accessToken: auth.accessToken,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(
          data.error === 'Invalid code'
            ? 'Code not found — check it and try again'
            : data.error === 'Couple already full'
            ? 'This couple is already complete'
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
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div>
          <button
            onClick={() => step === 'code' ? setStep('email') : router.back()}
            className="text-[#9B88C8] text-sm font-bold block mb-6"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-[#2B3A4A]">Join with a code</h1>
          <p className="text-sm text-[#2B3A4A]/50 mt-1.5">
            {step === 'email'
              ? 'Verify your email so you can always sign back in.'
              : 'Your partner shared a 6-character code with you.'}
          </p>
        </div>

        {step === 'email' && <OtpForm onVerified={handleVerified} />}

        {step === 'code' && (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-2">
                  Your name
                </label>
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
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-2">
                  Invite code
                </label>
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

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button
              onClick={handleJoin}
              disabled={loading || !myName.trim() || inviteCode.trim().length < 6}
              className="w-full h-14 rounded-2xl bg-[#C4B5E0] text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? 'Joining…' : 'Join our space'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
