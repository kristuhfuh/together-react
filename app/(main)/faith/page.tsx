'use client'
import { useState, useEffect } from 'react'
import { useSession, useToast } from '@/lib/store'
import { SCRIPTURE_TOPICS } from '@/lib/data/scripture'
import { useRealtime } from '@/hooks/useRealtime'

function dailyTopicId(): string {
  const day = Math.floor(Date.now() / 86400000)
  return SCRIPTURE_TOPICS[day % SCRIPTURE_TOPICS.length].id
}

export default function Faith() {
  const myName = useSession(s => s.myName)
  const partnerName = useSession(s => s.partnerName)
  const coupleId = useSession(s => s.coupleId)
  const slot = useSession(s => s.slot)
  const show = useToast(s => s.show)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [verseIdx, setVerseIdx] = useState(0)
  const [reflections, setReflections] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [studyCount, setStudyCount] = useState(0)

  const todayId = dailyTopicId()
  const topic = selectedId ? SCRIPTURE_TOPICS.find(t => t.id === selectedId) ?? null : null

  async function loadReflections(topicId: string) {
    const res = await fetch(`/api/faith?topic=${topicId}`)
    if (res.ok) setReflections(await res.json())
  }

  async function loadStats() {
    const res = await fetch('/api/faith')
    if (res.ok) {
      const d = await res.json()
      setStudyCount(d.count ?? 0)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (selectedId) {
      setVerseIdx(0)
      setDraft('')
      loadReflections(selectedId)
    }
  }, [selectedId])

  useRealtime(coupleId, (table) => {
    if (table === 'faith_reflections' && selectedId) loadReflections(selectedId)
  })

  async function handleSave() {
    if (!draft.trim() || !selectedId || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/faith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: selectedId, reflection: draft.trim() }),
      })
      if (res.ok) {
        if (slot) setReflections(r => ({ ...r, [slot]: draft.trim() }))
        setDraft('')
        setStudyCount(c => c + 1)
        show('Reflection saved 💜')
      } else {
        show('Could not save — try again')
      }
    } catch {
      show('Could not connect')
    } finally {
      setSaving(false)
    }
  }

  if (!topic) {
    const todayTopic = SCRIPTURE_TOPICS.find(t => t.id === todayId)!

    return (
      <main className="px-5 pt-12 pb-6 max-w-sm mx-auto space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8]">Daily Study</p>
            <h1 className="text-2xl font-extrabold text-[#2B3A4A] mt-1">Bible Topics</h1>
          </div>
          {studyCount > 0 && (
            <div className="bg-[#EDE8F5] rounded-2xl px-3 py-2 text-center">
              <p className="text-xl font-extrabold text-[#9B88C8] leading-none">{studyCount}</p>
              <p className="text-[9px] font-bold text-[#9B88C8]/60 uppercase tracking-wide mt-0.5">studied</p>
            </div>
          )}
        </div>

        {/* Today's topic */}
        <div
          onClick={() => setSelectedId(todayId)}
          className="bg-gradient-to-br from-[#C4B5E0] to-[#9B88C8] rounded-3xl p-5 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">Today's Topic</p>
          <p className="text-2xl font-extrabold text-white">{todayTopic.title}</p>
          <p className="text-sm text-white/70 font-medium mt-0.5">{todayTopic.subtitle}</p>
          <p className="text-xs text-white/60 font-bold mt-4">Study now →</p>
        </div>

        {/* All topics grid */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 mb-3">All Topics</p>
          <div className="grid grid-cols-2 gap-3">
            {SCRIPTURE_TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border ${
                  t.id === todayId
                    ? 'bg-[#EDE8F5] border-[#C4B5E0]'
                    : 'bg-white border-[#EDE8F5] shadow-sm'
                }`}
              >
                <p className="font-extrabold text-[#2B3A4A] text-sm">{t.title}</p>
                <p className="text-[11px] text-[#2B3A4A]/50 mt-0.5 font-medium leading-snug">{t.subtitle}</p>
                {t.id === todayId && (
                  <p className="text-[9px] font-extrabold text-[#9B88C8] uppercase tracking-widest mt-2">Today</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    )
  }

  const verse = topic.verses[verseIdx]
  const myRef = slot ? reflections[slot] : undefined
  const partnerRef = reflections[slot === 'A' ? 'B' : 'A']

  return (
    <main className="px-5 pt-12 pb-6 max-w-sm mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => setSelectedId(null)}
            className="text-[#9B88C8] text-sm font-bold block mb-1"
          >
            ← Topics
          </button>
          <h1 className="text-2xl font-extrabold text-[#2B3A4A]">{topic.title}</h1>
          <p className="text-xs text-[#2B3A4A]/50 font-medium">{topic.subtitle}</p>
        </div>
        {topic.id === todayId && (
          <div className="bg-[#EDE8F5] rounded-xl px-2.5 py-1.5">
            <p className="text-[9px] font-extrabold text-[#9B88C8] uppercase tracking-widest">Today</p>
          </div>
        )}
      </div>

      {/* Verse card */}
      <div className="bg-[#EDE8F5] rounded-3xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-3">
          {verse.ref}
        </p>
        <p className="text-base text-[#2B3A4A] font-medium leading-relaxed italic">
          "{verse.text}"
        </p>
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={() => setVerseIdx(i => (i - 1 + topic.verses.length) % topic.verses.length)}
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#9B88C8] font-bold active:scale-95 transition-transform"
          >
            ←
          </button>
          <span className="text-[11px] font-bold text-[#2B3A4A]/40">
            {verseIdx + 1} / {topic.verses.length}
          </span>
          <button
            onClick={() => setVerseIdx(i => (i + 1) % topic.verses.length)}
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#9B88C8] font-bold active:scale-95 transition-transform"
          >
            →
          </button>
        </div>
      </div>

      {/* Discussion question */}
      <div className="bg-white rounded-2xl p-4 border border-[#EDE8F5]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-1.5">Discuss Together</p>
        <p className="text-sm text-[#2B3A4A] font-medium leading-snug">{topic.discussion}</p>
      </div>

      {/* Reflection */}
      {!myRef ? (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">Your reflection</p>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="What does this stir in you?"
            rows={4}
            className="w-full bg-white border border-[#EDE8F5] rounded-2xl px-4 py-3 text-base text-[#2B3A4A] font-medium resize-none outline-none focus:border-[#C4B5E0] transition-colors leading-relaxed"
          />
          <button
            onClick={handleSave}
            disabled={saving || !draft.trim()}
            className="w-full h-12 rounded-2xl bg-[#C4B5E0] text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save reflection'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-[#EDE8F5]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-1.5">
              {myName || 'You'}
            </p>
            <p className="text-sm text-[#2B3A4A] font-medium leading-relaxed">{myRef}</p>
          </div>

          {partnerRef ? (
            <div className="bg-[#EDE8F5] rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-1.5">
                {partnerName || 'Partner'}
              </p>
              <p className="text-sm text-[#2B3A4A] font-medium leading-relaxed">{partnerRef}</p>
            </div>
          ) : (
            <div className="bg-[#F7F4FB] rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-[#9B88C8]/70">
                Waiting for {partnerName || 'your partner'} to reflect… 💜
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
