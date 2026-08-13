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

  const [editingMyName, setEditingMyName] = useState(false)
  const [myNameInput, setMyNameInput] = useState(myName)
  const [editingPartnerName, setEditingPartnerName] = useState(false)
  const [partnerNameInput, setPartnerNameInput] = useState(partnerName)
  const [savingName, setSavingName] = useState(false)

  const [datingSince, setDatingSince] = useState('')
  const [nextVisit, setNextVisit] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [savingDates, setSavingDates] = useState(false)
  const [notifBusy, setNotifBusy] = useState(false)

  const [showReset, setShowReset] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState('')

  useEffect(() => {
    fetch('/api/couple').then(r => r.json()).then(d => {
      if (d.dating_since) setDatingSince(d.dating_since)
      if (d.next_visit) setNextVisit(d.next_visit)
      if (d.invite_code) setInviteCode(d.invite_code)
    })
    setMyNameInput(myName)
    setPartnerNameInput(partnerName)
  }, [myName, partnerName])

  async function handleSaveMyName() {
    if (!myNameInput.trim() || myNameInput.trim() === myName || savingName) return
    setSavingName(true)
    try {
      const res = await fetch('/api/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myName: myNameInput.trim() }),
      })
      const data = await res.json()
      if (res.ok && coupleId && slot) {
        setSession({ coupleId, slot, myName: data.myName, partnerName })
        setEditingMyName(false)
        show('Name updated')
      } else {
        show('Could not update — try again')
      }
    } catch {
      show('Could not connect')
    } finally {
      setSavingName(false)
    }
  }

  async function handleSavePartnerName() {
    if (!partnerNameInput.trim() || partnerNameInput.trim() === partnerName || savingName) return
    setSavingName(true)
    try {
      const res = await fetch('/api/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerName: partnerNameInput.trim() }),
      })
      const data = await res.json()
      if (res.ok && coupleId && slot) {
        setSession({ coupleId, slot, myName, partnerName: data.partnerName })
        setEditingPartnerName(false)
        show("Partner's name updated")
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
      if (res.ok) show('Saved')
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
    if (ok) show('Notifications enabled')
    else show('Could not enable — check your browser settings')
    setNotifBusy(false)
  }

  async function handleSignOut() {
    await fetch('/api/signout', { method: 'POST' })
    localStorage.clear()
    window.location.href = '/welcome'
  }

  async function handleReset() {
    if (!resetCode.trim() || resetting) return
    setResetting(true)
    setResetError('')
    try {
      const res = await fetch('/api/member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: resetCode.trim() }),
      })
      if (res.ok) {
        localStorage.clear()
        window.location.href = '/welcome'
      } else {
        const data = await res.json()
        setResetError(data.error === 'Wrong invite code' ? 'Wrong code — check and try again' : 'Something went wrong')
      }
    } catch {
      setResetError('Could not connect')
    } finally {
      setResetting(false)
    }
  }

  return (
    <main className="px-5 pt-10 pb-24 max-w-sm mx-auto space-y-6">

      {/* Header */}
      <div>
        <p className="text-xs font-medium text-[#2B3A4A]/40">Your account</p>
        <h1 className="text-2xl font-extrabold text-[#2B3A4A] mt-0.5">Profile</h1>
      </div>

      {/* Names */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0EDF8] space-y-4">
        <p className="text-xs font-semibold text-[#2B3A4A]/40">Names</p>

        {/* My name */}
        <div>
          {editingMyName ? (
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-[#2B3A4A]/40">You</p>
              <input
                type="text"
                value={myNameInput}
                onChange={e => setMyNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveMyName()}
                autoFocus
                className="w-full h-12 bg-[#F7F4FB] border border-[#EDE8F5] rounded-xl px-4 text-base font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={() => { setEditingMyName(false); setMyNameInput(myName) }} className="flex-1 h-10 rounded-xl border border-[#EDE8F5] text-[#2B3A4A]/50 font-semibold text-sm">Cancel</button>
                <button onClick={handleSaveMyName} disabled={savingName || !myNameInput.trim() || myNameInput.trim() === myName} className="flex-1 h-10 rounded-xl bg-[#C4B5E0] text-white font-semibold text-sm disabled:opacity-50">{savingName ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#C4B5E0] flex items-center justify-center text-white font-bold text-sm">
                  {(myName || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-medium text-[#2B3A4A]/40">You</p>
                  <p className="font-bold text-[#2B3A4A] text-sm">{myName || '—'}</p>
                </div>
              </div>
              <button onClick={() => setEditingMyName(true)} className="text-sm text-[#9B88C8] font-semibold">Edit</button>
            </div>
          )}
        </div>

        <div className="border-t border-[#F0EDF8]" />

        {/* Partner name */}
        <div>
          {editingPartnerName ? (
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-[#2B3A4A]/40">Partner</p>
              <input
                type="text"
                value={partnerNameInput}
                onChange={e => setPartnerNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSavePartnerName()}
                autoFocus
                className="w-full h-12 bg-[#F7F4FB] border border-[#EDE8F5] rounded-xl px-4 text-base font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={() => { setEditingPartnerName(false); setPartnerNameInput(partnerName) }} className="flex-1 h-10 rounded-xl border border-[#EDE8F5] text-[#2B3A4A]/50 font-semibold text-sm">Cancel</button>
                <button onClick={handleSavePartnerName} disabled={savingName || !partnerNameInput.trim() || partnerNameInput.trim() === partnerName} className="flex-1 h-10 rounded-xl bg-[#C4B5E0] text-white font-semibold text-sm disabled:opacity-50">{savingName ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#9B88C8] flex items-center justify-center text-white font-bold text-sm">
                  {(partnerName || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-medium text-[#2B3A4A]/40">Partner</p>
                  <p className="font-bold text-[#2B3A4A] text-sm">{partnerName || '—'}</p>
                </div>
              </div>
              <button onClick={() => setEditingPartnerName(true)} className="text-sm text-[#9B88C8] font-semibold">Edit</button>
            </div>
          )}
        </div>
      </div>

      {/* Invite code */}
      {inviteCode && (
        <div className="bg-[#EDE8F5] rounded-3xl p-5">
          <p className="text-xs font-semibold text-[#9B88C8] mb-1">Invite Code</p>
          <p className="text-3xl font-extrabold text-[#2B3A4A] tracking-[0.15em]">{inviteCode}</p>
          <p className="text-xs text-[#2B3A4A]/40 font-medium mt-1">Share with your partner to join</p>
        </div>
      )}

      {/* Important dates */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0EDF8] space-y-4">
        <p className="text-xs font-semibold text-[#2B3A4A]/40">Important dates</p>
        <div>
          <label className="text-[10px] font-medium text-[#2B3A4A]/40 block mb-1.5">Dating since</label>
          <input type="date" value={datingSince} onChange={e => setDatingSince(e.target.value)} className="w-full h-12 bg-[#F7F4FB] border border-[#EDE8F5] rounded-xl px-4 text-sm font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors" />
          {datingSince && <p className="text-[11px] text-[#2B3A4A]/40 font-medium mt-1">Since {fmtDate(datingSince)}</p>}
        </div>
        <div>
          <label className="text-[10px] font-medium text-[#2B3A4A]/40 block mb-1.5">Next visit</label>
          <input type="date" value={nextVisit} onChange={e => setNextVisit(e.target.value)} className="w-full h-12 bg-[#F7F4FB] border border-[#EDE8F5] rounded-xl px-4 text-sm font-semibold text-[#2B3A4A] outline-none focus:border-[#C4B5E0] transition-colors" />
          {nextVisit && <p className="text-[11px] text-[#2B3A4A]/40 font-medium mt-1">{fmtDate(nextVisit)}</p>}
        </div>
        <button onClick={handleSaveDates} disabled={savingDates} className="w-full h-12 rounded-xl bg-[#C4B5E0] text-white font-semibold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform">
          {savingDates ? 'Saving…' : 'Save dates'}
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0EDF8]">
        <p className="text-xs font-semibold text-[#2B3A4A]/40 mb-1">Notifications</p>
        <p className="text-xs text-[#2B3A4A]/50 font-medium mb-4">Get notified when your partner is thinking of you</p>
        {permission === 'granted' ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <p className="text-sm font-semibold text-[#2B3A4A]/60">Notifications enabled</p>
          </div>
        ) : (
          <button onClick={handleNotifications} disabled={notifBusy} className="w-full h-12 rounded-xl bg-[#F7F4FB] border border-[#EDE8F5] text-[#9B88C8] font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50">
            {notifBusy ? 'Enabling…' : 'Enable notifications'}
          </button>
        )}
      </div>

      {/* Session */}
      <div className="pt-2">
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-xl border border-[#EDE8F5] text-[#2B3A4A]/50 font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          Sign out
        </button>
      </div>

      {/* Danger zone — visually separated */}
      <div className="border-t border-[#F0EDF8] pt-4 pb-2">
        <p className="text-[10px] font-medium text-[#2B3A4A]/30 mb-3">Danger zone</p>
        <button
          onClick={() => { setShowReset(true); setResetCode(''); setResetError('') }}
          className="w-full h-12 rounded-xl border border-red-100 bg-red-50/50 text-red-400 font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          Leave this couple
        </button>
        <p className="text-[10px] text-[#2B3A4A]/30 font-medium text-center mt-2">
          Your slot will be freed. The couple stays.
        </p>
      </div>

      {/* Leave confirmation modal */}
      {showReset && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-[#FBF8F4] rounded-t-3xl p-6 space-y-4 max-w-sm mx-auto">
            <div className="w-10 h-1 bg-[#2B3A4A]/10 rounded-full mx-auto" />
            <div>
              <h3 className="font-extrabold text-[#2B3A4A] text-lg">Leave this couple?</h3>
              <p className="text-sm text-[#2B3A4A]/50 font-medium mt-1">
                Your slot will be freed. Your partner stays. Enter your invite code to confirm.
              </p>
            </div>
            <input
              type="text"
              value={resetCode}
              onChange={e => setResetCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="Invite code"
              maxLength={6}
              autoFocus
              className="w-full h-14 bg-white border border-[#EDE8F5] rounded-2xl px-4 text-3xl font-extrabold text-[#2B3A4A] outline-none focus:border-red-300 transition-colors tracking-[0.25em] text-center"
            />
            {resetError && <p className="text-red-500 text-sm font-medium">{resetError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 h-12 rounded-2xl border border-[#EDE8F5] text-[#2B3A4A]/60 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting || resetCode.length < 6}
                className="flex-1 h-12 rounded-2xl bg-red-400 text-white font-semibold text-sm disabled:opacity-50"
              >
                {resetting ? 'Leaving…' : 'Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
