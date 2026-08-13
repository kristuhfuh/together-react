import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const topicId = new URL(req.url).searchParams.get('topic')

  if (!topicId) {
    const { count } = await supabaseAdmin
      .from('faith_reflections')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', session.coupleId)
      .eq('slot', session.slot)
    return NextResponse.json({ count: count ?? 0 })
  }

  const { data } = await supabaseAdmin
    .from('faith_reflections')
    .select('slot, reflection')
    .eq('couple_id', session.coupleId)
    .eq('topic_id', topicId)

  const result: Record<string, string> = {}
  for (const row of data ?? []) result[row.slot] = row.reflection
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topicId, reflection } = await req.json()
  if (!topicId || !reflection?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('faith_reflections')
    .upsert(
      {
        couple_id: session.coupleId,
        slot: session.slot,
        topic_id: topicId,
        reflection: reflection.trim(),
      },
      { onConflict: 'couple_id,slot,topic_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('faith_sessions').insert({
    couple_id: session.coupleId,
    slot: session.slot,
    topic_id: topicId,
    studied_on: new Date().toISOString().slice(0, 10),
  })

  return NextResponse.json({ ok: true })
}
