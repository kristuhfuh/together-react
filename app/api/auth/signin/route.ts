import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { signSession, sessionCookieHeader } from '@/lib/session'

export async function POST(req: Request) {
  const { email, accessToken } = await req.json()
  if (!email || !accessToken) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(accessToken)
  if (authErr || !user || user.email !== email) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { data: member } = await supabaseAdmin
    .from('couple_members')
    .select('couple_id, slot, name')
    .eq('email', email)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'No account found' }, { status: 404 })
  }

  const { data: couple } = await supabaseAdmin
    .from('couples')
    .select('id')
    .eq('id', member.couple_id)
    .single()

  if (!couple) {
    return NextResponse.json({ error: 'No account found' }, { status: 404 })
  }

  const partnerSlot = member.slot === 'A' ? 'B' : 'A'
  const { data: partner } = await supabaseAdmin
    .from('couple_members')
    .select('name')
    .eq('couple_id', member.couple_id)
    .eq('slot', partnerSlot)
    .single()

  const token = await signSession({
    coupleId: member.couple_id,
    slot: member.slot as 'A' | 'B',
    myName: member.name,
    partnerName: partner?.name ?? '',
  })

  return NextResponse.json(
    { ok: true },
    { headers: { 'Set-Cookie': sessionCookieHeader(token) } }
  )
}
