import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase/server'
import webpush from 'web-push'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidContact = process.env.VAPID_CONTACT

  if (!vapidPublic || !vapidPrivate || !vapidContact) {
    return NextResponse.json({ error: 'Push not configured' }, { status: 503 })
  }

  webpush.setVapidDetails(vapidContact, vapidPublic, vapidPrivate)

  const partnerSlot = session.slot === 'A' ? 'B' : 'A'

  const { data } = await supabaseAdmin
    .from('couple_members')
    .select('push_subscription, name')
    .eq('couple_id', session.coupleId)
    .eq('slot', partnerSlot)
    .single()

  if (!data?.push_subscription) {
    return NextResponse.json({ error: 'Partner has not enabled notifications' }, { status: 404 })
  }

  try {
    await webpush.sendNotification(
      data.push_subscription as webpush.PushSubscription,
      JSON.stringify({
        title: '💜 Thinking of you',
        body: `${session.myName} is thinking of you right now`,
      })
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Push failed' }, { status: 500 })
  }
}
