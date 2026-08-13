'use client'
import { weekStrip } from '@/lib/utils'

interface WeeklyStripProps {
  checkins: Record<string, boolean>
}

export function WeeklyStrip({ checkins }: WeeklyStripProps) {
  const days = weekStrip()

  return (
    <div className="flex justify-between items-center px-1">
      {days.map(({ label, iso, isToday }) => {
        const checked = !!checkins[iso]
        return (
          <div key={iso} className="flex flex-col items-center gap-1.5">
            <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-[#9B88C8]' : 'text-[#2B3A4A]/35'}`}>
              {label}
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isToday ? 'ring-2 ring-[#9B88C8] ring-offset-2 ring-offset-white' : ''
              } ${checked ? 'bg-[#9B88C8]' : 'bg-[#F0EDF8]'}`}
            >
              {checked && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
