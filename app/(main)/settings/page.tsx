'use client'
import { useState, useEffect } from 'react'
import { useSession } from '@/lib/store'
import { useToast } from '@/lib/store'
import { useNotifications } from '@/hooks/useNotifications'
import { fmtDate } from '@/lib/utils'

export default function Settings() {
  const myName = useSession(s => s.myName)
  const partnerName = useSession(s => s.partnerName)
  const show = useToast(s => s.show)
  const { permission, subscribe } = useNotifications()

  const [startDate, setStartDate] = useState('')
  const [nextVisit, setNextVisit] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [notifBusy, setNotifBusy] = useState(false)

  useEffect(() => {
    fetch('/api/couple').then(r => r.json()).then(d => {
      if (d.start_date) setStartDate(d.start_date)
      if (d.next_visit) setNextVisit(d.next_visit)
      if (d.invite_code) setInviteCode(d.invite_code)
    })
  }, [])

  async function handleSaveDates() {
    setSaving(true)
    try {
      const res = await fetch('/api/couple', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, nextVisit }),
      })
      if (res.ok) show('Dates saved 💜')
      else show('Could not save — try again')
    } catch {
      show('Could not connect')
    } finally {
      setSaving(false)
    }
  }

  async function handleNotifications() {
    setNotifBusy(true)
    const result = await subscribe()
    if (result.ok) show('Notifications enabled 💜')
    else show(result.error ?? 'Could not enable notifications')
    setNotifBusy(false)
  }

  return (
    <main className="px-5 pt-12 pb-6 max-w-sm mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8]">Your Space</p>
        <h1 className="text-2xl font-extrabold text-[#2B3A4A] mt-1">Settings</h1>
      </div>

      {/* Names */}
      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">You & Your Partner</p>
        <div className="flex gap-3">
          <div className="flex-1 bg-[#F7F4FB] rounded-2xl px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-[#9B88C8] uppercase tracking-widest">You</p>
            <p className="font-extrabold text-[#2B3A4A] mt-0.5">{myName || '—'}</p>
          </div>
          <div className="flex-1 bg-[#EDE8F5] rounded-2xl px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-[#9B88C8] uppercase tracking-widest">Partner</p>
            <p className="font-extrabold text-[#2B3A4A] mt-0.5">{partnerName || '—'}</p>
          </div>
        </div>
      </div>

      {/* Invite code */}
      {inviteCode && (
        <div className="bg-[#EDE8F5] rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-1">Invite Code</p>
          <p className="text-3xl font-extrabold text-[#2B3A4A] tracking-[0.15em]">{inviteCode}</p>
          <p className="text-xs text-[#2B3A4A]/40 font-medium mt-1">Share with your partner to join</p>
        </div>
      )}

      {/* Dates */}
      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">Important Dates</p>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-1.5">
            Distance started
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full h-12 bg-[#F7F4FB] border border-[#EDE8F5] rounded-xl px-4 text-sm font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
          />
          {startDate && (
            <p className="text-[11px] text-[#2B3A4A]/40 font-medium mt-1">{fmtDate(startDate)}</p>
          )}
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-1.5">
            Next visit
          </label>
          <input
            type="date"
            value={nextVisit}
            onChange={e => setNextVisit(e.target.value)}
            className="w-full h-12 bg-[#F7F4FB] border border-[#EDE8F5] rounded-xl px-4 text-sm font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
          />
          {nextVisit && (
            <p className="text-[11px] text-[#2B3A4A]/40 font-medium mt-1">{fmtDate(nextVisit)}</p>
          )}
        </div>

        <button
          onClick={handleSaveDates}
          disabled={saving}
          className="w-full h-12 rounded-xl bg-[#C4B5E0] text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save dates'}
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 mb-1">Notifications</p>
        <p className="text-xs text-[#2B3A4A]/50 font-medium mb-4">
          Get notified when your partner is thinking of you
        </p>
        {permission === 'granted' ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <p className="text-sm font-bold text-[#2B3A4A]/60">Notifications enabled</p>
          </div>
        ) : (
          <button
            onClick={handleNotifications}
            disabled={notifBusy}
            className="w-full h-12 rounded-xl bg-[#EDE8F5] text-[#9B88C8] font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {notifBusy ? 'Enabling…' : 'Enable notifications'}
          </button>
        )}
      </div>

      {/* Sign out (clear cookie via hard nav) */}
      <div className="pt-2 text-center">
        <button
          onClick={async () => {
            await fetch('/api/signout', { method: 'POST' })
            window.location.href = '/welcome'
          }}
          className="text-sm text-[#2B3A4A]/30 font-bold"
        >
          Leave this device
        </button>
      </div>
    </main>
  )
}
