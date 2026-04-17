import { useQuery } from '@tanstack/react-query'

import { fetchAnalysisReport } from '../api/fetch-analysis-report'
import { gameRoomKeys } from './query-keys'

// AI 최종 분석 리포트 — 첫 호출 시 백엔드가 OpenAI 호출(5~10초), 이후는 DB 캐시.
// - retry: false  → 실패 시 재시도 X (OpenAI 비용 낭비 방지, 사용자가 명시적으로 재시도 버튼 눌러야 함)
// - staleTime: Infinity, gcTime: Infinity → 한 번 받으면 새로고침 X, 캐시 영구 유지
//   (리포트는 게임 종료 후 변하지 않는 결과물)
export function useAnalysisReportQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.report(roomId),
    queryFn: () => fetchAnalysisReport(roomId),
    enabled: !!roomId,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false
  })
}
