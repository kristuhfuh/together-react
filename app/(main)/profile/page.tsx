'use client'
import { useState, useEffect } from 'react'
import { useSession, useToast } from '@/lib/store'
import { useNotifications } from '@/hooks/useNotifications'
import { fmtDate } from '@/lib/utils'

export default function Profile() {
  const myName = useSession(s => s.myName)
  const partnerName = useSession(s => s.partnerName)
  const setSession = useSession(s => s.setSession)
  const coupleId = useSession(s => s.coupleId)
  const slot = useSession(s => s.slot)
  const show = useToast(s => s.show)
  const { permission, subscribe } = useNotifications()

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(myName)
  const [savingName, setSavingName] = useState(false)

  const [datingSince, setDatingSince] = useState('')
  const [nextVisit, setNextVisit] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [savingDates, setSavingDates] = useState(false)
  const [notifBusy, setNotifBusy] = useState(false)

  useEffect(() => {
    fetch('/api/couple').then(r => r.json()).then(d => {
      if (d.dating_since) setDatingSince(d.dating_since)
      if (d.next_visit) setNextVisit(d.next_visit)
      if (d.invite_code) setInviteCode(d.invite_code)
    })
    setNameInput(myName)
  }, [myName])

  async function handleSaveName() {
    if (!nameInput.trim() || nameInput.trim() === myName || savingName) return
    setSavingName(true)
    try {
      const res = await fetch('/api/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myName: nameInput.trim() }),
      })
      if (res.ok) {
        if (coupleId && slot) {
          setSession({ coupleId, slot, myName: nameInput.trim(), partnerName })
        }
        setEditingName(false)
        show('Name updated 💜')
      } else {
        show('Could not update — try again')
      }
    } catch {
      show('Could not connect')
    } finally {
      setSavingName(false)
    }
  }

  async function handleSaveDates() {
    setSavingDates(true)
    try {
      const res = await fetch('/api/couple', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datingSince, nextVisit }),
      })
      if (res.ok) show('Saved 💜')
      else show('Could not save — try again')
    } catch {
      show('Could not connect')
    } finally {
      setSavingDates(false)
    }
  }

  async function handleNotifications() {
    setNotifBusy(true)
    const ok = await subscribe()
    if (ok) show('Notifications enabled 💜')
    else show('Could not enable — check your browser settings')
    setNotifBusy(false)
  }

  function handleClearLocalData() {
    localStorage.clear()
    show('Local data cleared')
  }

  return (
    <main className="px-5 pt-12 pb-6 max-w-sm mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8]">Your Account</p>
        <h1 className="text-2xl font-extrabold text-[#2B3A4A] mt-1">Profile</h1>
      </div>

      {/* Name */}
      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">Your Name</p>

        {editingName ? (
          <div className="space-y-3">
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              autoFocus
              className="w-full h-12 bg-[#F7F4FB] border border-[#EDE8F5] rounded-xl px-4 text-base font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingName(false); setNameInput(myName) }}
                className="flex-1 h-10 rounded-xl border border-[#EDE8F5] text-[#2B3A4A]/50 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveName}
                disabled={savingName || !nameInput.trim() || nameInput.trim() === myName}
                className="flex-1 h-10 rounded-xl bg-[#C4B5E0] text-white font-bold text-sm disabled:opacity-50"
              >
                {savingName ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C4B5E0] flex items-center justify-center text-white font-extrabold text-base">
                {(myName || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-extrabold text-[#2B3A4A]">{myName || '—'}</p>
                <p className="text-[11px] text-[#2B3A4A]/40 font-medium">Partner: {partnerName || '—'}</p>
              </div>
            </div>
            <button
              onClick={() => setEditingName(true)}
              className="text-sm text-[#9B88C8] font-bold"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Invite code */}
      {inviteCode && (
        <div className="bg-[#EDE8F5] rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-1">Invite Code</p>
          <p className="text-3xl font-extrabold text-[#2B3A4A] tracking-[0.15em]">{inviteCode}</p>
          <p className="text-xs text-[#2B3A4A]/40 font-medium mt-1">Share with your partner to join</p>
        </div>
      )}

      {/* Important dates */}
      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">Important Dates</p>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40 block mb-1.5">
            Dating since
          </label>
          <input
            type="date"
            value={datingSince}
            onChange={e => setDatingSince(e.target.value)}
            className="w-full h-12 bg-[#F7F4FB] border border-[#EDE8F5] rounded-xl px-4 text-sm font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
          />
          {datingSince && (
            <p className="text-[11px] text-[#2B3A4A]/40 font-medium mt-1">Since {fmtDate(datingSince)}</p>
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
          disabled={savingDates}
          className="w-full h-12 rounded-xl bg-[#C4B5E0] text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {savingDates ? 'Saving…' : 'Save dates'}
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

      {/* Data */}
      <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B3A4A]/40">Data & Privacy</p>
        <button
          onClick={handleClearLocalData}
          className="w-full h-12 rounded-xl border border-[#EDE8F5] text-[#2B3A4A]/50 font-bold text-sm active:scale-[0.98] transition-transform text-left px-4"
        >
          Clear local cache & history
        </button>
      </div>

      {/* Sign out */}
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
