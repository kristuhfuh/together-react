'use client'
import { useState } from 'react'

interface Member {
  slot: string
  name: string
  email: string | null
  push_subscription: object | null
}

interface Couple {
  id: string
  invite_code: string
  start_date: string | null
  dating_since: string | null
  created_at: string
  members: Member[]
}

interface Stats {
  couples: number
  members: number
  pushEnabled: number
  photos: number
  writings: number
  faithReflections: number
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtRelative(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [couples, setCouples] = useState<Couple[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  async function handleLogin() {
    if (!password.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${password.trim()}` },
      })
      if (!res.ok) { setError('Wrong password'); setLoading(false); return }
      const data = await res.json()
      setStats(data.stats)
      setCouples(data.couples)
      setSecret(password.trim())
      setAuthed(true)
    } catch {
      setError('Could not connect')
    } finally {
      setLoading(false)
    }
  }

  async function refresh() {
    const res = await fetch('/api/admin', { headers: { Authorization: `Bearer ${secret}` } })
    if (res.ok) {
      const data = await res.json()
      setStats(data.stats)
      setCouples(data.couples)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="w-full max-w-xs space-y-5">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-white">Admin</p>
            <p className="text-sm text-gray-500 mt-1">Together dashboard</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Admin password"
            autoFocus
            className="w-full h-12 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm font-mono text-white outline-none focus:border-purple-500 transition-colors"
          />
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !password.trim()}
            className="w-full h-12 rounded-xl bg-purple-600 text-white font-bold text-sm disabled:opacity-40"
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </div>
      </div>
    )
  }

  const statCards = stats ? [
    { label: 'Couples', value: stats.couples, color: 'text-purple-400' },
    { label: 'Members', value: stats.members, color: 'text-blue-400' },
    { label: 'Push enabled', value: stats.pushEnabled, color: 'text-green-400' },
    { label: 'Photos', value: stats.photos, color: 'text-pink-400' },
    { label: 'Writings', value: stats.writings, color: 'text-yellow-400' },
    { label: 'Reflections', value: stats.faithReflections, color: 'text-orange-400' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-950 text-white px-5 pt-10 pb-16 max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Together Admin</h1>
          <p className="text-xs text-gray-500 mt-0.5">together-react.vercel.app</p>
        </div>
        <button
          onClick={refresh}
          className="text-xs text-purple-400 font-bold border border-purple-900 rounded-lg px-3 py-1.5"
        >
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {statCards.map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Couples list */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
          All Couples ({couples.length})
        </p>
        <div className="space-y-2">
          {couples.length === 0 && (
            <p className="text-gray-600 text-sm">No couples yet.</p>
          )}
          {couples.map(c => {
            const slotA = c.members.find(m => m.slot === 'A')
            const slotB = c.members.find(m => m.slot === 'B')
            const full = !!slotA && !!slotB
            const isExpanded = expanded === c.id

            return (
              <div key={c.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : c.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${full ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <div>
                      <p className="font-mono text-sm font-bold text-white tracking-widest">{c.invite_code}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {slotA?.name || '—'} & {slotB?.name || <span className="text-yellow-500">waiting…</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{fmtRelative(c.created_at)}</p>
                    <p className="text-[10px] text-gray-700 mt-0.5">{isExpanded ? '▲' : '▼'}</p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-800 px-4 py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[slotA, slotB].map((m, i) => (
                        <div key={i} className="bg-gray-950 rounded-xl p-3 border border-gray-800">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                            Slot {i === 0 ? 'A' : 'B'}
                          </p>
                          {m ? (
                            <>
                              <p className="font-bold text-white text-sm">{m.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5 break-all">{m.email ?? 'no email'}</p>
                              <p className={`text-[10px] font-bold mt-2 ${m.push_subscription ? 'text-green-400' : 'text-gray-600'}`}>
                                {m.push_subscription ? '🔔 push on' : 'push off'}
                              </p>
                            </>
                          ) : (
                            <p className="text-yellow-500 text-sm font-semibold">Empty</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Joined</p>
                        <p className="font-semibold text-gray-400">{fmtDate(c.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Dating since</p>
                        <p className="font-semibold text-gray-400">{fmtDate(c.dating_since)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">LDR started</p>
                        <p className="font-semibold text-gray-400">{fmtDate(c.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Couple ID</p>
                        <p className="font-mono text-[10px] text-gray-600 break-all">{c.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
