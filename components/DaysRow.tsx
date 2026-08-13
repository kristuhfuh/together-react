import { daysApart, daysUntil, datingDuration, fmtDate } from '@/lib/utils'

interface DaysRowProps {
  startDate: string | null
  nextVisit: string | null
  datingSince: string | null
}

export function DaysRow({ startDate, nextVisit, datingSince }: DaysRowProps) {
  const apart = daysApart(startDate)
  const until = daysUntil(nextVisit)
  const duration = datingDuration(datingSince)

  return (
    <div className="space-y-3">
      {datingSince && (
        <div className="bg-gradient-to-br from-[#C4B5E0] to-[#9B88C8] rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Together</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-extrabold text-white leading-none">{duration}</p>
              <p className="text-xs text-white/60 mt-1.5 font-medium">since {fmtDate(datingSince)}</p>
            </div>
            <div className="text-4xl opacity-60">💜</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-1">Days Apart</p>
          <p className="text-4xl font-extrabold text-[#2B3A4A] leading-none">{apart}</p>
          {startDate ? (
            <p className="text-[11px] text-[#2B3A4A]/40 mt-1.5 font-medium">since {fmtDate(startDate)}</p>
          ) : (
            <p className="text-[11px] text-[#2B3A4A]/30 mt-1.5 font-medium">set in settings</p>
          )}
        </div>

        <div className="bg-[#EDE8F5] rounded-3xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B88C8] mb-1">
            {until !== null ? 'Next Visit' : 'Next Visit'}
          </p>
          {until !== null ? (
            <>
              <p className="text-4xl font-extrabold text-[#9B88C8] leading-none">{until}</p>
              <p className="text-[11px] text-[#2B3A4A]/40 mt-1.5 font-medium">
                {until === 0 ? '🎉 Today!' : until === 1 ? 'tomorrow' : 'days away'}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-extrabold text-[#9B88C8]/30 leading-none">—</p>
              <p className="text-[11px] text-[#2B3A4A]/30 mt-1.5 font-medium">set in profile</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
