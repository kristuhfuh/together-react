import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { signSession, sessionCookieHeader } from '@/lib/session'

export async function POST(req: Request) {
  const { code, myName, email, accessToken } = await req.json()
  if (!code?.trim() || !myName?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (email && accessToken) {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(accessToken)
    if (authErr || !user || user.email !== email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  const { data: couple, error } = await supabaseAdmin
    .from('couples')
    .select('id')
    .eq('invite_code', code.trim().toUpperCase())
    .single()

  if (error || !couple) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })

  const { data: members } = await supabaseAdmin
    .from('couple_members')
    .select('slot, name')
    .eq('couple_id', couple.id)

  const slotA = members?.find(m => m.slot === 'A')
  const slotB = members?.find(m => m.slot === 'B')

  if (!slotA) return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
  if (slotB) return NextResponse.json({ error: 'Couple already full' }, { status: 409 })

  const { error: insertErr } = await supabaseAdmin.from('couple_members').insert({
    couple_id: couple.id,
    slot: 'B',
    name: myName.trim(),
    ...(email ? { email } : {}),
  })

  if (insertErr) return NextResponse.json({ error: 'DB error' }, { status: 500 })

  const token = await signSession({
    coupleId: couple.id,
    slot: 'B',
    myName: myName.trim(),
    partnerName: slotA.name,
  })

  return NextResponse.json(
    { partnerName: slotA.name },
    { headers: { 'Set-Cookie': sessionCookieHeader(token) } }
  )
}
