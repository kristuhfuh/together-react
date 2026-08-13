'use client'
import { useEffect } from 'react'
import { useSession } from '@/lib/store'
import type { Session } from '@/lib/session'

export function SessionProvider({
  session,
  children,
}: {
  session: Session
  children: React.ReactNode
}) {
  const setSession = useSession(s => s.setSession)

  useEffect(() => {
    setSession(session)
  }, [session, setSession])

  return <>{children}</>
}
