'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Verifying your email…')

  useEffect(() => {
    async function handle() {
      // Supabase automatically parses the hash and sets the session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user?.email) {
        setStatus('Verification failed — please try again')
        setTimeout(() => router.push('/welcome'), 2000)
        return
      }

      const email = session.user.email
      const accessToken = session.access_token

      // Try to sign in with our session system
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessToken }),
      })

      if (res.ok) {
        // Existing couple — go straight to home
        router.push('/home')
      } else {
        // Email verified but no couple yet — continue create flow
        sessionStorage.setItem('together-pending-auth', JSON.stringify({ email, accessToken }))
        router.push('/create')
      }
    }

    handle()
  }, [router])

  return (
    <main className="min-h-screen bg-[#FBF8F4] flex items-center justify-center px-6">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EDE8F5] flex items-center justify-center text-2xl mx-auto">💜</div>
        <p className="text-[#2B3A4A]/60 text-sm font-medium">{status}</p>
      </div>
    </main>
  )
}
