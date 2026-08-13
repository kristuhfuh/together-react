import { daysApart, daysUntil, datingDuration, fmtDate } from '@/lib/utils'
import Link from 'next/link'

interface DaysRowProps {
  startDate: string | null
  nextVisit: string | null
  datingSince: string | null
}

export function DaysRow({ startDate, nextVisit, datingSince }: DaysRowProps) {
  const apart = daysApart(startDate)
  const until = daysUntil(nextVisit)
  const duration = datingDuration(datingSince)

  const hasAnyData = datingSince || startDate || nextVisit !== null

  if (!hasAnyData) {
    return (
      <Link href="/profile" className="block">
        <p className="text-xs text-[#9B88C8]/60 font-medium">
          Add your dates in <span className="font-bold text-[#9B88C8]">Profile →</span>
        </p>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {datingSince && (
        <>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-[#2B3A4A]/40">Together</p>
            <p className="text-sm font-bold text-[#9B88C8]">{duration}</p>
          </div>
          <div className="w-px h-6 bg-[#EDE8F5] flex-shrink-0" />
        </>
      )}

      {startDate && (
        <>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-[#2B3A4A]/40">Apart</p>
            <p className="text-sm font-bold text-[#2B3A4A]">{apart}d</p>
          </div>
          {until !== null && <div className="w-px h-6 bg-[#EDE8F5] flex-shrink-0" />}
        </>
      )}

      {until !== null && (
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-[#2B3A4A]/40">
            {until === 0 ? 'Visit' : 'Visit in'}
          </p>
          <p className="text-sm font-bold text-[#9B88C8]">
            {until === 0 ? 'Today 🎉' : `${until}d`}
          </p>
        </div>
      )}
    </div>
  )
}
