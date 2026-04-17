import { baseApi } from '@/shared/api/base-api'

import { analysisReportResponseSchema } from '../model/analysis-report.schema'

// 첫 호출 시 백엔드가 OpenAI를 호출하므로 5~10초 소요.
// 게임 기간이 길수록 컨텍스트(턴별 시장개요 + 매매내역)가 커져 응답 시간 증가 가능.
// 6개월(약 26턴) ~ 12개월(약 52턴) 등 장기 게임 안전 마진까지 확보 → 90초.
const ANALYSIS_REPORT_TIMEOUT_MS = 90_000

// AI 최종 분석 리포트 조회
// - 첫 호출: OpenAI 호출 후 DB 저장 (5~10초)
// - 이후 호출: DB 캐시에서 즉시 반환 (~ms)
export async function fetchAnalysisReport(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}/report`, {
    timeout: ANALYSIS_REPORT_TIMEOUT_MS
  })
  return analysisReportResponseSchema.parse(response.data)
}
