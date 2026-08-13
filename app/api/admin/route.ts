import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import webpush from 'web-push'

function authorized(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${process.env.ADMIN_SECRET}`
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [
    { data: couples },
    { data: members },
    { count: photoCount },
    { count: writingCount },
    { count: faithCount },
    { count: answerCount },
    { data: storageFiles },
  ] = await Promise.all([
    supabaseAdmin
      .from('couples')
      .select('id, invite_code, start_date, dating_since, created_at, next_visit')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('couple_members')
      .select('couple_id, slot, name, email, push_subscription'),
    supabaseAdmin.from('photos').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('writings').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('faith_reflections').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('daily_answers').select('id', { count: 'exact', head: true }),
    supabaseAdmin.storage.from('photos').list('', { limit: 1000, offset: 0 }),
  ])

  const membersByCouple = (members ?? []).reduce<Record<string, typeof members>>((acc, m) => {
    if (!acc[m.couple_id]) acc[m.couple_id] = []
    acc[m.couple_id]!.push(m)
    return acc
  }, {})

  const coupleRows = (couples ?? []).map(c => ({
    ...c,
    members: membersByCouple[c.id] ?? [],
  }))

  const pushEnabled = (members ?? []).filter(m => m.push_subscription).length
  const fullCouples = Object.values(membersByCouple).filter(ms => (ms ?? []).length === 2).length

  const storageFolders = storageFiles?.length ?? 0
  const storageMb = Math.round((photoCount ?? 0) * 0.35)

  return NextResponse.json({
    stats: {
      couples: couples?.length ?? 0,
      fullCouples,
      members: members?.length ?? 0,
      pushEnabled,
      photos: photoCount ?? 0,
      writings: writingCount ?? 0,
      faithReflections: faithCount ?? 0,
      dailyAnswers: answerCount ?? 0,
      storageMb,
    },
    couples: coupleRows,
  })
}

export async function DELETE(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { coupleId, slot } = await req.json()
  if (!coupleId) return NextResponse.json({ error: 'coupleId required' }, { status: 400 })

  // Remove just one member slot, then auto-delete couple if no members remain
  if (slot) {
    const { error } = await supabaseAdmin
      .from('couple_members')
      .delete()
      .eq('couple_id', coupleId)
      .eq('slot', slot)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { count } = await supabaseAdmin
      .from('couple_members')
      .select('slot', { count: 'exact', head: true })
      .eq('couple_id', coupleId)

    if ((count ?? 0) === 0) {
      const { data: photos } = await supabaseAdmin
        .from('photos')
        .select('storage_path')
        .eq('couple_id', coupleId)
      if (photos?.length) {
        await supabaseAdmin.storage.from('photos').remove(photos.map(p => p.storage_path))
      }
      await supabaseAdmin.from('couples').delete().eq('id', coupleId)
    }

    return NextResponse.json({ ok: true })
  }

  // Delete entire couple + storage
  const { data: photos } = await supabaseAdmin
    .from('photos')
    .select('storage_path')
    .eq('couple_id', coupleId)

  if (photos?.length) {
    await supabaseAdmin.storage.from('photos').remove(photos.map(p => p.storage_path))
  }

  const { error } = await supabaseAdmin.from('couples').delete().eq('id', coupleId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { coupleId, slot, name } = await req.json()
  if (!coupleId || !slot || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('couple_members')
    .update({ name: name.trim() })
    .eq('couple_id', coupleId)
    .eq('slot', slot)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { coupleId, slot } = await req.json()
  if (!coupleId || !slot) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidContact = process.env.VAPID_CONTACT

  if (!vapidPublic || !vapidPrivate || !vapidContact) {
    return NextResponse.json({ error: 'Push not configured' }, { status: 503 })
  }

  const { data: member } = await supabaseAdmin
    .from('couple_members')
    .select('push_subscription, name')
    .eq('couple_id', coupleId)
    .eq('slot', slot)
    .single()

  if (!member?.push_subscription) {
    return NextResponse.json({ error: 'No push subscription for this member' }, { status: 404 })
  }

  try {
    webpush.setVapidDetails(vapidContact, vapidPublic, vapidPrivate)
    await webpush.sendNotification(
      member.push_subscription as webpush.PushSubscription,
      JSON.stringify({
        title: '🔔 Admin test',
        body: `Push notification test for ${member.name}`,
      })
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
