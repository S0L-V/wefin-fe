import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { stompClient } from '@/shared/api/stomp-client'

export function useGameRoomSocket(roomId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    function subscribe() {
      subscription = stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
        try {
          const eventType = JSON.parse(message.body)

          if (eventType === 'PARTICIPANT_JOINED' || eventType === 'PARTICIPANT_LEFT') {
            queryClient.invalidateQueries({ queryKey: ['game-room', 'detail', roomId] })
          }

          if (eventType === 'GAME_STARTED') {
            queryClient.invalidateQueries({ queryKey: ['game-room'] })
            navigate(`/history/room/${roomId}/play`)
          }
        } catch {
          console.warn('[WebSocket] 메시지 파싱 실패:', message.body)
        }
      })
    }

    let prevOnConnect: typeof stompClient.onConnect | null = null

    if (stompClient.connected) {
      subscribe()
    } else {
      prevOnConnect = stompClient.onConnect
      stompClient.onConnect = (frame) => {
        prevOnConnect?.(frame)
        subscribe()
      }
    }

    return () => {
      subscription?.unsubscribe()
      if (prevOnConnect !== null) {
        stompClient.onConnect = prevOnConnect
      }
    }
  }, [roomId, queryClient, navigate])
}
