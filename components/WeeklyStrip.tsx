'use client'
import { weekStrip, today } from '@/lib/utils'

interface WeeklyStripProps {
  checkins: Record<string, boolean>
}

export function WeeklyStrip({ checkins }: WeeklyStripProps) {
  const days = weekStrip()
  const todayIso = today()

  return (
    <div className="flex justify-between items-end px-1">
      {days.map(({ label, iso, isToday }) => {
        const checked = !!checkins[iso]
        const isPast = iso < todayIso
        const isFuture = iso > todayIso

        return (
          <div key={iso} className="flex flex-col items-center gap-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isToday ? 'text-[#9B88C8]' : isFuture ? 'text-[#2B3A4A]/20' : 'text-[#2B3A4A]/35'
            }`}>
              {label}
            </span>

            <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center relative transition-all duration-200 ${
              checked
                ? 'bg-[#C4B5E0] shadow-sm shadow-[#C4B5E0]/40'
                : isToday
                ? 'bg-white ring-2 ring-[#C4B5E0]'
                : isPast
                ? 'bg-[#F0EDF8]'
                : 'bg-[#F0EDF8]/40'
            }`}>
              {checked ? (
                <span className="text-white text-base leading-none">💜</span>
              ) : (
                <span className={`text-[11px] font-extrabold leading-none ${
                  isToday ? 'text-[#9B88C8]'
                  : isPast ? 'text-[#2B3A4A]/30'
                  : 'text-[#2B3A4A]/15'
                }`}>
                  {new Date(iso + 'T12:00:00').getDate()}
                </span>
              )}

              {isPast && !checked && (
                <div className="w-1 h-1 rounded-full bg-[#2B3A4A]/15 mt-0.5" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
