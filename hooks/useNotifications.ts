'use client'
import { useState, useEffect, useCallback } from 'react'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr.buffer as ArrayBuffer
}

async function syncSubscription(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return false
    const res = await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    })
    return res.ok
  } catch {
    return false
  }
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof Notification === 'undefined') return
    const perm = Notification.permission
    if (perm !== 'granted') {
      setPermission(perm)
      return
    }
    // Permission already granted — re-sync subscription to DB in case it was lost
    syncSubscription().then(saved => {
      if (saved) setPermission('granted')
      // If not saved, leave as 'default' so the enable button shows
    })
  }, [])

  const subscribe = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { ok: false, error: 'Push not supported in this browser' }
    }

    try {
      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()

      if (!sub) {
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') {
          setPermission(perm)
          return { ok: false, error: 'Permission denied' }
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) return { ok: false, error: 'Push not configured' }

        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
      }

      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return { ok: false, error: data.error ?? `Server error ${res.status}` }
      }

      setPermission('granted')
      return { ok: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      return { ok: false, error: msg }
    }
  }, [])

  return { permission, subscribe }
}
