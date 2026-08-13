'use client'
import { useState, useEffect } from 'react'
import { useSession } from '@/lib/store'
import { useToast } from '@/lib/store'
import { fmtDate, today } from '@/lib/utils'
import { useRealtime } from '@/hooks/useRealtime'
import { Sheet } from '@/components/Sheet'

interface CalEvent {
  id: string
  title: string
  date: string
  type: 'visit' | 'milestone' | 'other'
  notes: string
}

const TYPE_COLORS = {
  visit: { bg: '#EDE8F5', text: '#9B88C8', label: 'Visit' },
  milestone: { bg: '#F9F3E8', text: '#C9963D', label: 'Milestone' },
  other: { bg: '#FBF1F3', text: '#C97688', label: 'Memory' },
}

export default function Calendar() {
  const coupleId = useSession(s => s.coupleId)
  const show = useToast(s => s.show)

  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState<'visit' | 'milestone' | 'other'>('visit')
  const [saving, setSaving] = useState(false)

  async function loadEvents() {
    const res = await fetch('/api/events')
    if (res.ok) setEvents(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadEvents() }, [])

  useRealtime(coupleId, (table) => {
    if (table === 'calendar_events') loadEvents()
  })

  async function handleAdd() {
    if (!title.trim() || !date || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), date, type }),
      })
      if (res.ok) {
        setSheetOpen(false)
        setTitle('')
        setDate('')
        setType('visit')
        loadEvents()
        show('Added to your plans 💜')
      } else {
        show('Could not save — try again')
      }
    } catch {
      show('Could not connect')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch('/api/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setEvents(e => e.filter(x => x.id !== id))
    } else {
      show('Could not delete')
    }
  }

  const todayStr = today()
  const upcoming = events.filter(e => e.date >= todayStr)
  const past = events.filter(e => e.date < todayStr)

  return (
    <main className="px-5 pt-12 pb-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8]">Shared</p>
          <h1 className="text-2xl font-extrabold text-[#2B3A4A]">Plans</h1>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="w-12 h-12 rounded-full bg-[#C4B5E0] text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform text-2xl font-bold"
        >
          +
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#C4B5E0] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">Upcoming</p>
              {upcoming.map(e => <EventCard key={e.id} event={e} onDelete={handleDelete} />)}
            </section>
          )}

          {upcoming.length === 0 && past.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <div className="text-4xl">📅</div>
              <p className="text-sm font-bold text-[#2B3A4A]/40">No plans yet</p>
              <p className="text-xs text-[#2B3A4A]/30 font-medium">Tap + to add your next visit</p>
            </div>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">Past</p>
              {past.map(e => <EventCard key={e.id} event={e} onDelete={handleDelete} past />)}
            </section>
          )}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add to your plans">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-2">
              What is it?
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Weekend visit, 1 year together…"
              className="w-full h-12 bg-white border border-[#EDE8F5] rounded-xl px-4 text-sm font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full h-12 bg-white border border-[#EDE8F5] rounded-xl px-4 text-sm font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-2">
              Type
            </label>
            <div className="flex gap-2">
              {(Object.keys(TYPE_COLORS) as Array<keyof typeof TYPE_COLORS>).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all ${
                    type === t ? 'ring-2 ring-[#9B88C8]' : 'opacity-60'
                  }`}
                  style={{ background: TYPE_COLORS[t].bg, color: TYPE_COLORS[t].text }}
                >
                  {TYPE_COLORS[t].label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || !title.trim() || !date}
            className="w-full h-12 rounded-xl bg-[#C4B5E0] text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add to plans'}
          </button>
        </div>
      </Sheet>
    </main>
  )
}

function EventCard({
  event,
  onDelete,
  past = false,
}: {
  event: CalEvent
  onDelete: (id: string) => void
  past?: boolean
}) {
  const colors = TYPE_COLORS[event.type]
  return (
    <div
      className={`rounded-2xl p-4 flex items-start justify-between gap-3 ${past ? 'opacity-50' : ''}`}
      style={{ background: colors.bg }}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5`} style={{ color: colors.text }}>
          {colors.label}
        </p>
        <p className="font-bold text-[#2B3A4A] text-sm leading-snug truncate">{event.title}</p>
        <p className="text-xs text-[#2B3A4A]/50 font-medium mt-0.5">{fmtDate(event.date)}</p>
      </div>
      <button
        onClick={() => onDelete(event.id)}
        className="text-[#2B3A4A]/25 hover:text-[#2B3A4A]/60 transition-colors text-lg font-bold flex-shrink-0"
      >
        ×
      </button>
    </div>
  )
}
