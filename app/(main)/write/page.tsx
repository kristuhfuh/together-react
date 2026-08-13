'use client'
import { useState, useEffect } from 'react'
import { useSession, useToast } from '@/lib/store'
import { useRealtime } from '@/hooks/useRealtime'

interface Writing {
  id: string
  slot: string
  title: string
  body: string
  created_at: string
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Write() {
  const myName = useSession(s => s.myName)
  const partnerName = useSession(s => s.partnerName)
  const coupleId = useSession(s => s.coupleId)
  const slot = useSession(s => s.slot)
  const show = useToast(s => s.show)

  const [writings, setWritings] = useState<Writing[]>([])
  const [loading, setLoading] = useState(true)
  const [composing, setComposing] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function loadWritings() {
    const res = await fetch('/api/writings')
    if (res.ok) setWritings(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadWritings() }, [])

  useRealtime(coupleId, (table) => {
    if (table === 'writings') loadWritings()
  })

  async function handleSave() {
    if (!body.trim() || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/writings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      })
      if (res.ok) {
        const newEntry = await res.json()
        setWritings(w => [newEntry, ...w])
        setTitle('')
        setBody('')
        setComposing(false)
        show('Posted')
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
    setDeleting(true)
    try {
      const res = await fetch('/api/writings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setWritings(w => w.filter(x => x.id !== id))
        setExpanded(null)
        setConfirmDelete(false)
      } else {
        show('Could not delete')
      }
    } catch {
      show('Could not connect')
    } finally {
      setDeleting(false)
    }
  }

  const expandedWriting = writings.find(w => w.id === expanded)

  return (
    <main className="px-5 pt-10 pb-24 max-w-sm mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-[#2B3A4A]/40">Shared</p>
          <h1 className="text-2xl font-extrabold text-[#2B3A4A] mt-0.5">Writing</h1>
          <p className="text-xs text-[#2B3A4A]/40 font-medium mt-0.5">Poetry, stories, thoughts</p>
        </div>
        <button
          onClick={() => setComposing(true)}
          className="w-11 h-11 rounded-full bg-[#C4B5E0] text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform text-xl font-bold"
        >
          +
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#C4B5E0] border-t-transparent animate-spin" />
        </div>
      ) : writings.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-sm font-semibold text-[#2B3A4A]/40">Nothing written yet</p>
          <p className="text-xs text-[#2B3A4A]/30 font-medium">Tap + to write something — a poem, a story, anything</p>
        </div>
      ) : (
        <div className="space-y-3">
          {writings.map(w => {
            const isMe = w.slot === slot
            const authorName = isMe ? myName : partnerName
            return (
              <button
                key={w.id}
                onClick={() => { setExpanded(w.id); setConfirmDelete(false) }}
                className="w-full text-left bg-white rounded-2xl p-4 border border-[#F0EDF8] active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isMe ? 'bg-[#C4B5E0]' : 'bg-[#9B88C8]'}`}>
                      {(authorName || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-[#2B3A4A]/60">{authorName || (isMe ? 'You' : 'Partner')}</span>
                  </div>
                  <span className="text-[10px] text-[#2B3A4A]/30 font-medium">{fmtRelative(w.created_at)}</span>
                </div>
                {w.title && (
                  <p className="font-bold text-[#2B3A4A] text-sm mb-1">{w.title}</p>
                )}
                <p className="text-sm text-[#2B3A4A]/60 font-medium leading-relaxed line-clamp-3">{w.body}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Compose sheet */}
      {composing && (
        <div className="fixed inset-0 z-50 bg-[#FBF8F4] flex flex-col">
          <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-[#EDE8F5]">
            <button
              onClick={() => { setComposing(false); setTitle(''); setBody('') }}
              className="text-[#9B88C8] font-semibold text-sm"
            >
              Cancel
            </button>
            <h2 className="font-bold text-[#2B3A4A]">New writing</h2>
            <button
              onClick={handleSave}
              disabled={saving || !body.trim()}
              className="text-[#9B88C8] font-semibold text-sm disabled:opacity-40"
            >
              {saving ? 'Posting…' : 'Post'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full text-xl font-bold text-[#2B3A4A] bg-transparent outline-none placeholder:text-[#2B3A4A]/20"
            />
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write something beautiful…"
              autoFocus
              className="w-full flex-1 text-base text-[#2B3A4A] font-medium bg-transparent outline-none resize-none leading-relaxed placeholder:text-[#2B3A4A]/25 min-h-[60vh]"
            />
          </div>
        </div>
      )}

      {/* Full entry view */}
      {expandedWriting && (
        <div className="fixed inset-0 z-50 bg-[#FBF8F4] flex flex-col">
          <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-[#EDE8F5]">
            <button onClick={() => { setExpanded(null); setConfirmDelete(false) }} className="text-[#9B88C8] font-semibold text-sm">
              ← Back
            </button>
            <div />
            {expandedWriting.slot === slot && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-[#2B3A4A]/30 font-semibold text-sm"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${expandedWriting.slot === slot ? 'bg-[#C4B5E0]' : 'bg-[#9B88C8]'}`}>
                {((expandedWriting.slot === slot ? myName : partnerName) || '?')[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-[#2B3A4A]/60">
                {expandedWriting.slot === slot ? myName : partnerName}
              </span>
              <span className="text-[10px] text-[#2B3A4A]/30 font-medium">
                · {fmtRelative(expandedWriting.created_at)}
              </span>
            </div>
            {expandedWriting.title && (
              <h2 className="text-2xl font-extrabold text-[#2B3A4A]">{expandedWriting.title}</h2>
            )}
            <p className="text-base text-[#2B3A4A] font-medium leading-relaxed whitespace-pre-wrap">
              {expandedWriting.body}
            </p>
          </div>

          {/* Delete confirmation — inline at bottom */}
          {confirmDelete && (
            <div className="border-t border-[#EDE8F5] px-5 py-4 bg-white space-y-3">
              <p className="text-sm font-semibold text-[#2B3A4A]">Delete this writing?</p>
              <p className="text-xs text-[#2B3A4A]/40 font-medium">This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-11 rounded-xl border border-[#EDE8F5] text-[#2B3A4A]/60 font-semibold text-sm"
                >
                  Keep it
                </button>
                <button
                  onClick={() => handleDelete(expandedWriting.id)}
                  disabled={deleting}
                  className="flex-1 h-11 rounded-xl bg-red-400 text-white font-semibold text-sm disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
