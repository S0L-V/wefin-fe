import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { onStompConnect, stompClient } from '@/shared/api/stomp-client'

import { gameRoomKeys, gameTurnKeys } from './query-keys'

/**
 * 턴 전환 WebSocket 구독.
 * 다른 참가자가 턴을 전환하면 TURN_CHANGE 이벤트를 수신하여
 * 관련 쿼리를 invalidate → 화면 자동 갱신.
 */
export function useTurnChangeSocket(roomId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!roomId) return

    let subscription: { unsubscribe: () => void } | null = null

    function subscribe() {
      subscription?.unsubscribe()
      subscription = stompClient.subscribe(`/topic/rooms/${roomId}/turn`, (message) => {
        try {
          const data = JSON.parse(message.body)

          if (data.type === 'TURN_CHANGE') {
            console.log('[TURN_CHANGE] invalidating queries for roomId:', roomId)
            queryClient.invalidateQueries({ queryKey: gameTurnKeys.current(roomId) })
            queryClient.invalidateQueries({ queryKey: gameRoomKeys.portfolio(roomId) })
            queryClient.invalidateQueries({ queryKey: gameRoomKeys.holdings(roomId) })
            queryClient
              .invalidateQueries({ queryKey: gameRoomKeys.briefing(roomId) })
              .then(() => console.log('[TURN_CHANGE] briefing invalidation complete'))
          }
        } catch {
          console.warn('[WebSocket] 턴 전환 메시지 파싱 실패:', message.body)
        }
      })
    }

    const removeListener = onStompConnect(subscribe)

    return () => {
      subscription?.unsubscribe()
      removeListener()
    }
  }, [roomId, queryClient])
}
