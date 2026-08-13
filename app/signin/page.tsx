'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OtpForm } from '@/components/OtpForm'

export default function SignIn() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleVerified(email: string, accessToken: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessToken }),
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
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div>
          <button onClick={() => router.back()} className="text-[#9B88C8] text-sm font-bold block mb-6">
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-[#2B3A4A]">Sign back in</h1>
          <p className="text-sm text-[#2B3A4A]/50 mt-1.5">
            We'll send a quick code to verify it's you.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-[#9B88C8] font-semibold">Signing you in…</p>
        ) : (
          <OtpForm onVerified={handleVerified} />
        )}

        {error && (
          <div className="space-y-3">
            <p className="text-red-500 text-sm font-medium">{error}</p>
            <button
              onClick={() => setError('')}
              className="w-full text-sm text-[#9B88C8] font-semibold py-2"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
