import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase/server'
import { today } from '@/lib/utils'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('couple_id', session.coupleId)
    .order('date')

  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, date, type, notes } = await req.json()
  if (!title?.trim() || !date) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .insert({
      couple_id: session.coupleId,
      title: title.trim(),
      date,
      type: type ?? 'other',
      notes: notes?.trim() ?? '',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (type === 'visit' && date >= today()) {
    await supabaseAdmin
      .from('couples')
      .update({ next_visit: date })
      .eq('id', session.coupleId)
  }

  return NextResponse.json({ id: data.id })
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await supabaseAdmin
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('couple_id', session.coupleId)

  return NextResponse.json({ ok: true })
}
