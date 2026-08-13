import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { signSession, sessionCookieHeader, getSession } from '@/lib/session'
import { genCode, today } from '@/lib/utils'

export async function POST(req: Request) {
  const { myName, partnerName, email } = await req.json()
  if (!myName?.trim() || !partnerName?.trim()) {
    return NextResponse.json({ error: 'Missing names' }, { status: 400 })
  }

  const inviteCode = genCode()

  const { data: couple, error: coupleErr } = await supabaseAdmin
    .from('couples')
    .insert({ invite_code: inviteCode, start_date: today() })
    .select('id')
    .single()

  if (coupleErr || !couple) {
    return NextResponse.json({ error: coupleErr?.message ?? 'DB error' }, { status: 500 })
  }

  const { error: memberErr } = await supabaseAdmin.from('couple_members').insert({
    couple_id: couple.id,
    slot: 'A',
    name: myName.trim(),
    ...(email ? { email: email.trim().toLowerCase() } : {}),
  })

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 })
  }

  const token = await signSession({
    coupleId: couple.id,
    slot: 'A',
    myName: myName.trim(),
    partnerName: partnerName.trim(),
  })

  return NextResponse.json(
    { inviteCode },
    { headers: { 'Set-Cookie': sessionCookieHeader(token) } }
  )
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('couples')
    .select('start_date, next_visit, invite_code, dating_since')
    .eq('id', session.coupleId)
    .single()

  return NextResponse.json(data ?? {})
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const update: Record<string, string> = {}
  if (body.startDate) update.start_date = body.startDate
  if (body.nextVisit !== undefined) update.next_visit = body.nextVisit
  if (body.datingSince !== undefined) update.dating_since = body.datingSince

  const { error } = await supabaseAdmin
    .from('couples')
    .update(update)
    .eq('id', session.coupleId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
