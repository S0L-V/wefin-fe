import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { invalidateTodayQuests } from '@/features/quest/model/use-today-quests'

import { fetchGameResult, fetchOrderHistory, fetchSnapshots } from '../api/fetch-game-result'
import { gameRoomKeys } from './query-keys'

// 게임 결과 조회 — 성과 요약 카드용
export function useGameResultQuery(roomId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: gameRoomKeys.result(roomId),
    queryFn: () => fetchGameResult(roomId),
    enabled: !!roomId
  })

  useEffect(() => {
    if (query.data) {
      void invalidateTodayQuests(queryClient)
    }
  }, [query.data, queryClient])

  return query
}

// 자산 변동 스냅샷 조회 — 라인 차트용 (본인 데이터만)
// 본인 데이터 정책: 다른 참가자 자산변동 비공개 → participantId 인자 없음
export function useSnapshotsQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.snapshots(roomId),
    queryFn: () => fetchSnapshots(roomId),
    enabled: !!roomId
  })
}

// 매매 내역 조회 — 테이블용 (본인만)
export function useOrderHistoryQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.orders(roomId),
    queryFn: () => fetchOrderHistory(roomId),
    enabled: !!roomId
  })
}
