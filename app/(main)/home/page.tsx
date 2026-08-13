'use client'
import { useEffect, useState } from 'react'
import { useSession } from '@/lib/store'
import { greeting, todayQuestion, today } from '@/lib/utils'
import { DAILY_QUESTIONS } from '@/lib/data/prompts'
import { DaysRow } from '@/components/DaysRow'
import { WeeklyStrip } from '@/components/WeeklyStrip'
import { ThinkingButton } from '@/components/ThinkingButton'
import { DeckCarousel } from '@/components/DeckCarousel'
import { useRealtime } from '@/hooks/useRealtime'
import Link from 'next/link'

interface CoupleInfo {
  start_date: string | null
  next_visit: string | null
  dating_since: string | null
  invite_code: string | null
}

export default function Home() {
  const myName = useSession(s => s.myName)
  const partnerName = useSession(s => s.partnerName)
  const coupleId = useSession(s => s.coupleId)
  const slot = useSession(s => s.slot)
  const partnerSlot = slot === 'A' ? 'B' : 'A'

  const [couple, setCouple] = useState<CoupleInfo>({ start_date: null, next_visit: null, dating_since: null, invite_code: null })
  const [partnerAnswered, setPartnerAnswered] = useState(false)
  const [checkins, setCheckins] = useState<Record<string, boolean>>({})
  const question = todayQuestion(DAILY_QUESTIONS)

  async function loadCouple() {
    const res = await fetch('/api/couple')
    if (res.ok) setCouple(await res.json())
  }

  async function loadAnswers() {
    const res = await fetch('/api/answers')
    if (res.ok) {
      const data = await res.json()
      setPartnerAnswered(!!data[partnerSlot])
      if (slot && data[slot]) {
        setCheckins(c => {
          const updated = { ...c, [today()]: true }
          localStorage.setItem('checkins', JSON.stringify(updated))
          return updated
        })
      }
    }
  }

  useEffect(() => {
    loadCouple()
    loadAnswers()
    const stored = localStorage.getItem('checkins')
    if (stored) {
      try { setCheckins(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  useRealtime(coupleId, (table) => {
    if (table === 'daily_answers') loadAnswers()
  })

  const partnerMissing = !partnerName

  return (
    <main className="px-5 pt-10 pb-24 max-w-sm mx-auto space-y-5">

      {/* Greeting */}
      <div>
        <p className="text-xs font-medium text-[#2B3A4A]/40">{greeting()}</p>
        <h1 className="text-2xl font-extrabold text-[#2B3A4A] mt-0.5">{myName || '…'}</h1>
      </div>

      {/* Invite banner — shown until partner joins */}
      {partnerMissing && couple.invite_code && (
        <Link href="/profile" className="flex items-center justify-between bg-[#EDE8F5] rounded-2xl px-4 py-3 active:scale-[0.99] transition-transform">
          <div>
            <p className="text-xs font-semibold text-[#9B88C8]">Waiting for your partner</p>
            <p className="text-xs text-[#2B3A4A]/50 font-medium mt-0.5">Share code <span className="font-extrabold text-[#2B3A4A] tracking-widest">{couple.invite_code}</span></p>
          </div>
          <p className="text-[#9B88C8] font-bold text-sm">→</p>
        </Link>
      )}

      {/* Today's Question — primary daily CTA */}
      <Link
        href="/question"
        className="block bg-[#EDE8F5] rounded-3xl p-5 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-start justify-between mb-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9B88C8]/70">Today's Question</p>
          {partnerAnswered && (
            <span className="text-[10px] font-semibold text-[#9B88C8] bg-white/60 rounded-full px-2 py-0.5">💜 answered</span>
          )}
        </div>
        <p className="text-[15px] font-semibold text-[#2B3A4A] leading-snug">{question}</p>
        <p className="text-xs font-bold text-[#9B88C8] mt-3">Answer →</p>
      </Link>

      {/* Thinking Button — emotional daily CTA */}
      <div className="flex justify-center py-3">
        <ThinkingButton partnerName={partnerName || 'them'} />
      </div>

      {/* Stats strip */}
      <DaysRow startDate={couple.start_date} nextVisit={couple.next_visit} datingSince={couple.dating_since} />

      {/* Weekly check-in strip */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-[#2B3A4A]/40">This week</p>
        <WeeklyStrip checkins={checkins} />
      </div>

      {/* Deck carousel */}
      <DeckCarousel />

    </main>
  )
}
