import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { stompClient } from '@/shared/api/stomp-client'

/**
 * 턴 전환 WebSocket 구독.
 * 다른 참가자가 턴을 전���하면 TURN_CHANGE 이벤트를 수신하여
 * 관련 쿼리를 invalidate → 화면 자동 갱신.
 */
export function useTurnChangeSocket(roomId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    function subscribe() {
      subscription = stompClient.subscribe(`/topic/rooms/${roomId}/turn`, (message) => {
        try {
          const data = JSON.parse(message.body)

          if (data.type === 'TURN_CHANGE') {
            queryClient.invalidateQueries({ queryKey: ['game-turn', 'current', roomId] })
            queryClient.invalidateQueries({ queryKey: ['game-room', 'portfolio', roomId] })
            queryClient.invalidateQueries({ queryKey: ['game-room', 'holdings', roomId] })
            queryClient.invalidateQueries({ queryKey: ['game-room', 'briefing', roomId] })
          }
        } catch {
          console.warn('[WebSocket] 턴 전환 메시지 파싱 실패:', message.body)
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
  }, [roomId, queryClient])
}
