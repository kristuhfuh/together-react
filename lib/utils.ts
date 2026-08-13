export const today = () => new Date().toISOString().slice(0, 10)

export function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.random() * chars.length | 0]).join('')
}

export function daysApart(startDate: string | null): number {
  if (!startDate) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000))
}

export function daysUntil(nextVisit: string | null): number | null {
  if (!nextVisit) return null
  const d = Math.ceil((new Date(nextVisit).getTime() - Date.now()) / 86400000)
  return d >= 0 ? d : null
}

export function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function fmtShort(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

export function todayQuestion(questions: string[]): string {
  const diff = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 86400000)
  return questions[diff % questions.length]
}

export function currentScriptureTopic<T extends { id: string }>(
  topics: T[],
  selectedId: string | null
): T {
  if (selectedId) return topics.find(t => t.id === selectedId) ?? topics[0]
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  return topics[week % topics.length]
}

export function datingDuration(datingSince: string | null): string {
  if (!datingSince) return ''
  const ms = Date.now() - new Date(datingSince + 'T12:00:00').getTime()
  const days = Math.floor(ms / 86400000)
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  const remDays = days % 30
  if (years > 0 && months > 0) return `${years}y ${months}m`
  if (years > 0) return `${years} yr${years > 1 ? 's' : ''}`
  if (months > 0) return `${months} mo${months > 1 ? 's' : ''}`
  return `${remDays} day${remDays !== 1 ? 's' : ''}`
}

export function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function weekStrip(): Array<{ label: string; iso: string; isToday: boolean }> {
  const dow = new Date().getDay()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - dow + i)
    const iso = d.toISOString().slice(0, 10)
    return { label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i], iso, isToday: iso === today() }
  })
}
