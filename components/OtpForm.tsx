'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Props {
  onVerified: (email: string, accessToken: string) => void
}

export function OtpForm({ onVerified }: Props) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendOtp() {
    if (!email.trim() || loading) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setStep('code')
  }

  async function verifyOtp() {
    if (code.length < 6 || loading) return
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: 'email',
    })
    setLoading(false)
    if (err || !data.session) { setError(err?.message ?? 'Invalid code — try again'); return }
    onVerified(email.trim(), data.session.access_token)
  }

  if (step === 'code') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#2B3A4A]/60">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-2">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoFocus
            className="w-full h-14 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-3xl font-extrabold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors tracking-[0.25em] text-center"
          />
        </div>
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        <button
          onClick={verifyOtp}
          disabled={loading || code.length < 6}
          className="w-full h-14 rounded-2xl bg-[#C4B5E0] text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Verify code'}
        </button>
        <button
          onClick={() => { setStep('email'); setCode(''); setError('') }}
          className="w-full text-sm text-[#9B88C8] font-semibold py-2"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-2">
          Your email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendOtp()}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          className="w-full h-14 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-base font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
        />
      </div>
      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
      <button
        onClick={sendOtp}
        disabled={loading || !email.trim()}
        className="w-full h-14 rounded-2xl bg-[#C4B5E0] text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send code'}
      </button>
    </div>
  )
}
