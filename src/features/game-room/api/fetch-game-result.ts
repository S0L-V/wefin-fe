import { baseApi } from '@/shared/api/base-api'

import {
  gameResultResponseSchema,
  orderHistoryResponseSchema,
  snapshotsResponseSchema
} from '../model/game-result.schema'

// 게임 결과 조회 (성과 요약 카드용)
export async function fetchGameResult(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}/result`)
  return gameResultResponseSchema.parse(response.data)
}

// 자산 변동 스냅샷 조회 (라인 차트용, 본인만)
// 본인 데이터 정책: API 시그니처에 participantId 없음 (다른 참가자 자산변동 비공개)
export async function fetchSnapshots(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}/snapshots`)
  return snapshotsResponseSchema.parse(response.data)
}

// 매매 내역 조회 (테이블용, 본인만)
export async function fetchOrderHistory(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}/orders`)
  return orderHistoryResponseSchema.parse(response.data)
}
