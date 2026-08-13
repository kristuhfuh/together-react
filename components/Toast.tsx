'use client'
import { useToast } from '@/lib/store'

export function Toast() {
  const { message, visible } = useToast()

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <div className="bg-[#2B3A4A] text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg whitespace-nowrap">
        {message}
      </div>
    </div>
  )
}
