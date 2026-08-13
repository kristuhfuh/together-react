'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const THRESHOLD = 72

export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const startY = useRef(0)
  const currentY = useRef(0)
  const active = useRef(false)
  const busy = useRef(false)

  const doRefresh = useCallback(async () => {
    busy.current = true
    setRefreshing(true)
    setPullY(THRESHOLD)
    currentY.current = THRESHOLD
    try { await onRefresh() } finally {
      busy.current = false
      setRefreshing(false)
      setPullY(0)
      currentY.current = 0
    }
  }, [onRefresh])

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 4 || busy.current) return
      startY.current = e.touches[0].clientY
      active.current = true
    }

    function onTouchMove(e: TouchEvent) {
      if (!active.current) return
      const delta = e.touches[0].clientY - startY.current
      if (delta <= 0) { active.current = false; return }
      const next = Math.min(delta * 0.45, THRESHOLD + 20)
      currentY.current = next
      setPullY(next)
    }

    function onTouchEnd() {
      if (!active.current) return
      active.current = false
      if (currentY.current >= THRESHOLD * 0.85) {
        doRefresh()
      } else {
        currentY.current = 0
        setPullY(0)
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [doRefresh])

  return { pullY, refreshing }
}
