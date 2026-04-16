import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { onStompConnect, stompClient } from '@/shared/api/stomp-client'

import { gameRoomKeys } from './query-keys'

export function useGameRoomSocket(roomId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    if (!roomId) return

    let subscription: { unsubscribe: () => void } | null = null

    function subscribe() {
      subscription?.unsubscribe()
      subscription = stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
        try {
          const eventType = JSON.parse(message.body)

          if (
            eventType === 'PARTICIPANT_JOINED' ||
            eventType === 'PARTICIPANT_LEFT' ||
            eventType === 'PARTICIPANT_FINISHED'
          ) {
            queryClient.invalidateQueries({ queryKey: gameRoomKeys.detail(roomId) })
          }

          if (eventType === 'GAME_STARTED') {
            queryClient.invalidateQueries({ queryKey: gameRoomKeys.all })
            navigate(`/history/room/${roomId}/play`)
          }
        } catch {
          console.warn('[WebSocket] 메시지 파싱 실패:', message.body)
        }
      })
    }

    const removeListener = onStompConnect(subscribe)

    return () => {
      subscription?.unsubscribe()
      removeListener()
    }
  }, [roomId, queryClient, navigate])
}
