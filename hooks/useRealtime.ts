'use client'
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

type RealtimeCallback = (table: string, payload: Record<string, unknown>) => void

export function useRealtime(coupleId: string | null, onUpdate: RealtimeCallback) {
  const cbRef = useRef(onUpdate)
  cbRef.current = onUpdate

  useEffect(() => {
    if (!coupleId) return

    const channel = supabase
      .channel(`couple:${coupleId}`)
      .on(
        'postgres_changes' as never,
        { event: '*', schema: 'public', table: 'daily_answers', filter: `couple_id=eq.${coupleId}` },
        (payload: Record<string, unknown>) => cbRef.current('daily_answers', payload)
      )
      .on(
        'postgres_changes' as never,
        { event: '*', schema: 'public', table: 'faith_reflections', filter: `couple_id=eq.${coupleId}` },
        (payload: Record<string, unknown>) => cbRef.current('faith_reflections', payload)
      )
      .on(
        'postgres_changes' as never,
        { event: '*', schema: 'public', table: 'photos', filter: `couple_id=eq.${coupleId}` },
        (payload: Record<string, unknown>) => cbRef.current('photos', payload)
      )
      .on(
        'postgres_changes' as never,
        { event: '*', schema: 'public', table: 'calendar_events', filter: `couple_id=eq.${coupleId}` },
        (payload: Record<string, unknown>) => cbRef.current('calendar_events', payload)
      )
      .on(
        'postgres_changes' as never,
        { event: '*', schema: 'public', table: 'writings', filter: `couple_id=eq.${coupleId}` },
        (payload: Record<string, unknown>) => cbRef.current('writings', payload)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [coupleId])
}
