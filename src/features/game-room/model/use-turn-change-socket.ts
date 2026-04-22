import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { onStompConnect, stompClient } from '@/shared/api/stomp-client'

import { gameRoomKeys, gameTurnKeys } from './query-keys'
import type { RankingItem, RankingsResponse } from './ranking.schema'
import { useGameFinishedStore } from './use-game-finished-store'
import type { RankChange } from './use-rank-change-store'
import { useRankChangeStore } from './use-rank-change-store'
import { useSelectedStockStore } from './use-selected-stock-store'

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
            // 랭킹 invalidate 전에 현재 순위 스냅샷 저장
            const prevRankings = queryClient.getQueryData<RankingsResponse>(
              gameRoomKeys.rankings(roomId)
            )
            const prevMap = new Map<string, RankingItem>()
            prevRankings?.data.forEach((r) => prevMap.set(r.userId, r))

            queryClient.invalidateQueries({ queryKey: gameTurnKeys.current(roomId) })
            queryClient.invalidateQueries({ queryKey: gameRoomKeys.portfolio(roomId) })
            queryClient.invalidateQueries({ queryKey: gameRoomKeys.holdings(roomId) })
            queryClient.invalidateQueries({ queryKey: gameRoomKeys.briefing(roomId) })
            queryClient.invalidateQueries({ queryKey: ['stockSearch', roomId] })
            queryClient.invalidateQueries({ queryKey: ['sectorStocks', roomId] })

            // 선택된 종목이 있으면 차트도 갱신
            const selectedSymbol = useSelectedStockStore.getState().selectedStock?.symbol
            if (selectedSymbol) {
              queryClient.invalidateQueries({
                queryKey: gameRoomKeys.stockChart(selectedSymbol, roomId)
              })
            }

            // 랭킹 invalidate 후 새 데이터와 비교
            queryClient.invalidateQueries({ queryKey: gameRoomKeys.rankings(roomId) }).then(() => {
              if (prevMap.size === 0) return

              const newRankings = queryClient.getQueryData<RankingsResponse>(
                gameRoomKeys.rankings(roomId)
              )
              if (!newRankings?.data) return

              const changes: RankChange[] = []
              for (const newItem of newRankings.data) {
                const prev = prevMap.get(newItem.userId)
                if (!prev) continue
                const delta = prev.rank - newItem.rank
                if (delta !== 0) {
                  changes.push({
                    userName: newItem.userName,
                    prevRank: prev.rank,
                    newRank: newItem.rank,
                    delta
                  })
                }
              }

              if (changes.length > 0) {
                changes.sort((a, b) => b.delta - a.delta || a.newRank - b.newRank)
                useRankChangeStore.getState().setRankChanges(changes)
              }
            })
          }

          if (data.type === 'GAME_FINISHED') {
            useGameFinishedStore.getState().setGameFinished()
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
