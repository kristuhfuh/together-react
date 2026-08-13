import { NextResponse } from 'next/server'
import { getSession, signSession, sessionCookieHeader } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { myName } = await req.json()
  if (!myName?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('couple_members')
    .update({ name: myName.trim() })
    .eq('couple_id', session.coupleId)
    .eq('slot', session.slot)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const token = await signSession({
    ...session,
    myName: myName.trim(),
  })

  return NextResponse.json(
    { ok: true, myName: myName.trim() },
    { headers: { 'Set-Cookie': sessionCookieHeader(token) } }
  )
}
