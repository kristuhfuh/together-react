'use client'
import { useEffect, useState } from 'react'
import { useSession } from '@/lib/store'
import { useToast } from '@/lib/store'
import { todayQuestion, today } from '@/lib/utils'
import { DAILY_QUESTIONS } from '@/lib/data/prompts'
import { useRealtime } from '@/hooks/useRealtime'

type State = 'loading' | 'unanswered' | 'waiting' | 'revealed'

export default function Question() {
  const myName = useSession(s => s.myName)
  const partnerName = useSession(s => s.partnerName)
  const coupleId = useSession(s => s.coupleId)
  const slot = useSession(s => s.slot)
  const partnerSlot = slot === 'A' ? 'B' : 'A'
  const show = useToast(s => s.show)

  const question = todayQuestion(DAILY_QUESTIONS)
  const [state, setState] = useState<State>('loading')
  const [myAnswer, setMyAnswer] = useState('')
  const [partnerAnswer, setPartnerAnswer] = useState('')
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function loadAnswers() {
    const res = await fetch(`/api/answers?date=${today()}`)
    if (!res.ok) return
    const data = await res.json()

    const mine = slot ? data[slot] as string | undefined : undefined
    const theirs = data[partnerSlot] as string | undefined

    if (mine) setMyAnswer(mine)
    if (theirs) setPartnerAnswer(theirs)

    if (mine && theirs) setState('revealed')
    else if (mine) setState('waiting')
    else setState('unanswered')
  }

  useEffect(() => { loadAnswers() }, [])

  useRealtime(coupleId, (table) => {
    if (table === 'daily_answers') loadAnswers()
  })

  async function handleSubmit() {
    if (!draft.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: draft.trim() }),
      })
      if (res.ok) {
        setMyAnswer(draft.trim())
        setState(partnerAnswer ? 'revealed' : 'waiting')
        const c = JSON.parse(localStorage.getItem('checkins') ?? '{}')
        c[today()] = true
        localStorage.setItem('checkins', JSON.stringify(c))
      } else {
        show('Could not save — try again')
      }
    } catch {
      show('Could not connect')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="px-5 pt-12 pb-6 max-w-sm mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8]">Today's Question</p>
        <h1 className="text-xl font-extrabold text-[#2B3A4A] mt-2 leading-snug">{question}</h1>
      </div>

      {state === 'loading' && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#C4B5E0] border-t-transparent animate-spin" />
        </div>
      )}

      {state === 'unanswered' && (
        <div className="space-y-4">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Write your answer…"
            rows={5}
            className="w-full bg-white border border-[#EDE8F5] rounded-2xl px-4 py-3 text-base text-[#2B3A4A] font-medium resize-none outline-none focus:border-[#C4B5E0] transition-colors leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !draft.trim()}
            className="w-full h-14 rounded-2xl bg-[#C4B5E0] text-white font-bold text-base shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Share my answer'}
          </button>
          <p className="text-[11px] text-[#2B3A4A]/40 text-center font-medium">
            {partnerName || 'Your partner'} will see your answer when they answer too
          </p>
        </div>
      )}

      {state === 'waiting' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-2">
              {myName || 'You'}
            </p>
            <p className="text-base text-[#2B3A4A] font-medium leading-relaxed">{myAnswer}</p>
          </div>

          <div className="bg-[#EDE8F5] rounded-3xl p-5 text-center">
            <div className="text-3xl mb-2">💜</div>
            <p className="text-sm font-bold text-[#9B88C8]">
              Waiting for {partnerName || 'your partner'}…
            </p>
            <p className="text-xs text-[#2B3A4A]/40 mt-1 font-medium">
              Their answer will appear here when they reply
            </p>
          </div>
        </div>
      )}

      {state === 'revealed' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-2">
              {myName || 'You'}
            </p>
            <p className="text-base text-[#2B3A4A] font-medium leading-relaxed">{myAnswer}</p>
          </div>

          <div className="bg-[#EDE8F5] rounded-3xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-2">
              {partnerName || 'Partner'}
            </p>
            <p className="text-base text-[#2B3A4A] font-medium leading-relaxed">{partnerAnswer}</p>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#2B3A4A]/40 font-medium">New question tomorrow 💜</p>
          </div>
        </div>
      )}
    </main>
  )
}
