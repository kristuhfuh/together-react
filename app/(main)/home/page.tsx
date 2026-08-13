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
}

export default function Home() {
  const myName = useSession(s => s.myName)
  const partnerName = useSession(s => s.partnerName)
  const coupleId = useSession(s => s.coupleId)
  const slot = useSession(s => s.slot)
  const partnerSlot = slot === 'A' ? 'B' : 'A'

  const [couple, setCouple] = useState<CoupleInfo>({ start_date: null, next_visit: null, dating_since: null })
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

  return (
    <main className="px-5 pt-12 pb-6 space-y-5 max-w-sm mx-auto">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">{greeting()}</p>
        <h1 className="text-3xl font-extrabold text-[#2B3A4A] mt-0.5">{myName || '…'}</h1>
      </div>

      <DaysRow startDate={couple.start_date} nextVisit={couple.next_visit} datingSince={couple.dating_since} />

      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 mb-4">This Week</p>
        <WeeklyStrip checkins={checkins} />
      </div>

      <Link
        href="/question"
        className="block bg-[#EDE8F5] rounded-3xl p-5 active:scale-[0.98] transition-transform"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-2">Today's Question</p>
        <p className="text-base font-semibold text-[#2B3A4A] leading-snug line-clamp-2">{question}</p>
        {partnerAnswered && (
          <p className="text-xs text-[#9B88C8] font-semibold mt-2">
            💜 {partnerName || 'Your partner'} has answered
          </p>
        )}
        <p className="text-xs font-bold text-[#9B88C8] mt-3">Answer →</p>
      </Link>

      <div className="flex justify-center py-2">
        <ThinkingButton partnerName={partnerName || 'them'} />
      </div>

      <DeckCarousel />
    </main>
  )
}
