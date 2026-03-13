'use client'

import { useEffect, useState } from 'react'
import { setupPresenceChannel } from '@/lib/supabase'
import type { PresenceState } from '@/lib/types'

export function usePresence(userId: string, userName: string, userColor: string) {
  const [others, setOthers] = useState<PresenceState[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const presenceChannel = setupPresenceChannel(userId)

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState<PresenceState>()
        const otherUsers = Object.values(presenceState)
          .flat()
          .filter((p) => p.userId !== userId)

        setOthers(otherUsers)
      })
      .on('presence', { event: 'join' }, () => {
        const presenceState = presenceChannel.presenceState<PresenceState>()
        const otherUsers = Object.values(presenceState)
          .flat()
          .filter((p) => p.userId !== userId)

        setOthers(otherUsers)
      })
      .on('presence', { event: 'leave' }, () => {
        const presenceState = presenceChannel.presenceState<PresenceState>()
        const otherUsers = Object.values(presenceState)
          .flat()
          .filter((p) => p.userId !== userId)

        setOthers(otherUsers)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userId,
            name: userName,
            color: userColor,
            cursor: null,
          })
          setIsConnected(true)
        }
      })

    return () => {
      presenceChannel.unsubscribe()
    }
  }, [userId, userName, userColor])

  const setSelfCursor = async (x: number, y: number) => {
    const presenceChannel = setupPresenceChannel(userId)
    await presenceChannel.track({
      userId,
      name: userName,
      color: userColor,
      cursor: { x, y },
    })
  }

  return {
    others,
    isConnected,
    setSelfCursor,
  }
}
