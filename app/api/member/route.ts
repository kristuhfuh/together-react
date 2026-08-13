import { NextResponse } from 'next/server'
import { getSession, signSession, sessionCookieHeader } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { myName, partnerName } = await req.json()

  let newMyName = session.myName
  let newPartnerName = session.partnerName

  if (myName?.trim()) {
    const { error } = await supabaseAdmin
      .from('couple_members')
      .update({ name: myName.trim() })
      .eq('couple_id', session.coupleId)
      .eq('slot', session.slot)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    newMyName = myName.trim()
  }

  if (partnerName?.trim()) {
    const partnerSlot = session.slot === 'A' ? 'B' : 'A'
    const { error } = await supabaseAdmin
      .from('couple_members')
      .update({ name: partnerName.trim() })
      .eq('couple_id', session.coupleId)
      .eq('slot', partnerSlot)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    newPartnerName = partnerName.trim()
  }

  const token = await signSession({
    ...session,
    myName: newMyName,
    partnerName: newPartnerName,
  })

  return NextResponse.json(
    { ok: true, myName: newMyName, partnerName: newPartnerName },
    { headers: { 'Set-Cookie': sessionCookieHeader(token) } }
  )
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inviteCode } = await req.json()
  if (!inviteCode) return NextResponse.json({ error: 'Invite code required' }, { status: 400 })

  const { data: couple } = await supabaseAdmin
    .from('couples')
    .select('invite_code')
    .eq('id', session.coupleId)
    .single()

  if (!couple || couple.invite_code !== inviteCode.trim().toUpperCase()) {
    return NextResponse.json({ error: 'Wrong invite code' }, { status: 403 })
  }

  await supabaseAdmin
    .from('couple_members')
    .delete()
    .eq('couple_id', session.coupleId)
    .eq('slot', session.slot)

  return NextResponse.json(
    { ok: true },
    { headers: { 'Set-Cookie': 'together_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' } }
  )
}
