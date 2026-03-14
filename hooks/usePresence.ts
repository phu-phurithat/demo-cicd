'use client'

import { useEffect, useState, useRef } from 'react'
import { setupPresenceChannel } from '@/lib/supabase'
import type { PresenceState } from '@/lib/types'

export function usePresence(userId: string, userName: string, userColor: string) {
  const [others, setOthers] = useState<PresenceState[]>([])
  const [isConnected, setIsConnected] = useState(false)
  
  // Use refs instead of state so setSelfCursor always has current values
  const editingTaskIdRef = useRef<string | null>(null)
  const cursorUpdateRef = useRef<NodeJS.Timeout | null>(null)
  const lastCursorRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const presenceChannel = setupPresenceChannel(userId)
    let syncTimer: NodeJS.Timeout

    const updateOthers = () => {
      const presenceState = presenceChannel.presenceState<PresenceState>()
      const otherUsers = Object.values(presenceState)
        .flat()
        .filter((p) => p.userId !== userId)
      setOthers(otherUsers)
    }

    presenceChannel
      .on('presence', { event: 'sync' }, updateOthers)
      .on('presence', { event: 'join' }, updateOthers)
      .on('presence', { event: 'leave' }, updateOthers)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userId,
            name: userName,
            color: userColor,
            cursor: null,
            editingTaskId: null,
          })
          setIsConnected(true)
          updateOthers()
          
          // Poll for presence updates every 1 second
          syncTimer = setInterval(updateOthers, 1000)
        }
      })

    return () => {
      presenceChannel.unsubscribe()
      if (syncTimer) clearInterval(syncTimer)
    }
  }, [userId, userName, userColor])

  const setSelfCursor = (x: number, y: number) => {
    // Store the latest cursor position
    lastCursorRef.current = { x, y }
    
    // Don't show cursor if editing a task
    if (editingTaskIdRef.current) return
    
    // If throttle is already pending, wait for it
    if (cursorUpdateRef.current) return
    
    // Immediately send first update, then throttle subsequent ones
    const sendCursorUpdate = async () => {
      const presenceChannel = setupPresenceChannel(userId)
      const cursor = lastCursorRef.current
      if (cursor) {
        await presenceChannel.track({
          userId,
          name: userName,
          color: userColor,
          cursor,
          editingTaskId: null,
        })
      }
      cursorUpdateRef.current = null
    }
    
    sendCursorUpdate()
    
    // Set timer to batch next update (100ms = smoother curve, matches 500ms animation)
    cursorUpdateRef.current = setTimeout(() => {
      sendCursorUpdate()
    }, 100)
  }

  const setEditingTask = async (taskId: string | null) => {
    editingTaskIdRef.current = taskId
    const presenceChannel = setupPresenceChannel(userId)
    
    // When entering edit mode: clear cursor, set editingTaskId
    // When exiting edit mode: clear editingTaskId but DON'T set cursor (let setSelfCursor handle cursor resume)
    if (taskId) {
      // Entering edit mode - explicitly clear cursor
      await presenceChannel.track({
        userId,
        name: userName,
        color: userColor,
        cursor: null,
        editingTaskId: taskId,
      })
    } else {
      // Exiting edit mode - clear editingTaskId, cursor will be re-established by setSelfCursor
      await presenceChannel.track({
        userId,
        name: userName,
        color: userColor,
        cursor: lastCursorRef.current, // Restore last known cursor position
        editingTaskId: null,
      })
    }
  }

  return {
    others,
    isConnected,
    setSelfCursor,
    setEditingTask,
  }
}
