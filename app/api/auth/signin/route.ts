import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { signSession, sessionCookieHeader } from '@/lib/session'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const normalised = email.trim().toLowerCase()

  const { data: member } = await supabaseAdmin
    .from('couple_members')
    .select('couple_id, slot, name')
    .eq('email', normalised)
    .single()

  if (!member) {
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
