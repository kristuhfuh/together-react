import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

function authorized(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${process.env.ADMIN_SECRET}`
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    { data: couples },
    { data: members },
    { count: photoCount },
    { count: writingCount },
    { count: faithCount },
  ] = await Promise.all([
    supabaseAdmin
      .from('couples')
      .select('id, invite_code, start_date, dating_since, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('couple_members')
      .select('couple_id, slot, name, email, push_subscription'),
    supabaseAdmin.from('photos').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('writings').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('faith_reflections').select('id', { count: 'exact', head: true }),
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

  return NextResponse.json({
    stats: {
      couples: couples?.length ?? 0,
      members: members?.length ?? 0,
      pushEnabled,
      photos: photoCount ?? 0,
      writings: writingCount ?? 0,
      faithReflections: faithCount ?? 0,
    },
    couples: coupleRows,
  })
}
