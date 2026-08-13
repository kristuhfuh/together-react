'use client'
import { create } from 'zustand'

interface ToastState {
  message: string
  visible: boolean
  show: (msg: string) => void
  hide: () => void
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  visible: false,
  show: (message) => {
    set({ message, visible: true })
    setTimeout(() => set({ visible: false }), 3000)
  },
  hide: () => set({ visible: false }),
}))

interface SessionState {
  coupleId: string | null
  slot: 'A' | 'B' | null
  myName: string
  partnerName: string
  setSession: (s: { coupleId: string; slot: 'A' | 'B'; myName: string; partnerName: string }) => void
}

export const useSession = create<SessionState>((set) => ({
  coupleId: null,
  slot: null,
  myName: '',
  partnerName: '',
  setSession: (s) => set(s),
}))
