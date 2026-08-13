'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { OtpForm } from '@/components/OtpForm'

export default function Create() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'names' | 'done'>('email')
  const [auth, setAuth] = useState<{ email: string; accessToken: string } | null>(null)
  const [myName, setMyName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')

  function handleVerified(email: string, accessToken: string) {
    setAuth({ email, accessToken })
    setStep('names')
  }

  async function handleCreate() {
    if (!myName.trim() || !partnerName.trim() || !auth || loading) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/couple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myName: myName.trim(),
          partnerName: partnerName.trim(),
          email: auth.email,
          accessToken: auth.accessToken,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setCode(data.inviteCode)
      setStep('done')
    } catch {
      setError('Could not connect. Check your internet.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <main className="min-h-screen bg-[#FBF8F4] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="text-5xl">🎉</div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#2B3A4A]">Your space is ready</h1>
            <p className="text-sm text-[#2B3A4A]/50 mt-1">
              Share this code with {partnerName} so they can join
            </p>
          </div>
          <div className="bg-[#EDE8F5] rounded-3xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-3">Invite Code</p>
            <p className="text-5xl font-extrabold text-[#2B3A4A] tracking-[0.15em]">{code}</p>
          </div>
          <button
            onClick={() => router.push('/home')}
            className="w-full h-14 rounded-2xl bg-[#C4B5E0] text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform"
          >
            Enter your space →
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FBF8F4] flex flex-col px-6 pt-14 pb-8">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div>
          <button
            onClick={() => step === 'names' ? setStep('email') : router.back()}
            className="text-[#9B88C8] text-sm font-bold block mb-6"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-[#2B3A4A]">Start your space</h1>
          <p className="text-sm text-[#2B3A4A]/50 mt-1.5">
            {step === 'email'
              ? 'Verify your email so you can always sign back in.'
              : "You'll get a code to share with your partner."}
          </p>
        </div>

        {step === 'email' && <OtpForm onVerified={handleVerified} />}

        {step === 'names' && (
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
                  placeholder="e.g. Sarah"
                  autoComplete="given-name"
                  className="w-full h-14 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-base font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-2">
                  Partner's name
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={e => setPartnerName(e.target.value)}
                  placeholder="e.g. James"
                  className="w-full h-14 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-base font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading || !myName.trim() || !partnerName.trim()}
              className="w-full h-14 rounded-2xl bg-[#C4B5E0] text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create our space'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
