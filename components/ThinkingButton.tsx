'use client'
import { useState } from 'react'
import { useToast } from '@/lib/store'

interface ThinkingButtonProps {
  partnerName: string
}

export function ThinkingButton({ partnerName }: ThinkingButtonProps) {
  const [busy, setBusy] = useState(false)
  const [ripple, setRipple] = useState(false)
  const show = useToast(s => s.show)

  async function handlePress() {
    if (busy) return
    setBusy(true)
    setRipple(true)
    setTimeout(() => setRipple(false), 700)

    try {
      const res = await fetch('/api/notify', { method: 'POST' })
      if (res.ok) {
        show(`${partnerName} knows you're thinking of them 💜`)
      } else {
        const data = await res.json().catch(() => ({}))
        if (res.status === 404) {
          show(`${partnerName} hasn't enabled notifications yet`)
        } else if (res.status === 503) {
          show('Push notifications not set up yet')
        } else {
          show(data.error ?? 'Could not send — try again')
        }
      }
    } catch {
      show('Could not connect')
    } finally {
      setTimeout(() => setBusy(false), 2500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <button
        onClick={handlePress}
        disabled={busy}
        className="relative w-20 h-20 rounded-full bg-[#F7DDE1] shadow-md active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center"
      >
        {ripple && (
          <span className="absolute inset-0 rounded-full bg-[#EFC5CB] animate-ping opacity-50" />
        )}
        <span className="text-3xl relative z-10">💜</span>
      </button>
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">
        Thinking of {partnerName}
      </p>
    </div>
  )
}
