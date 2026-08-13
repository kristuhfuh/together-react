import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { BottomNav } from '@/components/BottomNav'
import { SessionProvider } from '@/components/SessionProvider'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/welcome')

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen pb-16">
        {children}
      </div>
      <BottomNav />
    </SessionProvider>
  )
}
