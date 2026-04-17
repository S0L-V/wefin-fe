import { z } from 'zod'

// === AI 최종 분석 리포트 (GET /rooms/{roomId}/report) ===
// 백엔드: AnalysisReportResponse (performance/pattern/suggestion 3 TEXT 필드 + generatedAt OffsetDateTime)
// 백엔드 정책: 게임 종료(FINISHED) 참가자 본인만 조회 가능, lazy 생성 (첫 호출 5~10초)

export const analysisReportDataSchema = z.object({
  performance: z.string().min(1),
  pattern: z.string().min(1),
  suggestion: z.string().min(1),
  generatedAt: z.iso.datetime({ offset: true })
})

export const analysisReportResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: analysisReportDataSchema
})

export type AnalysisReportData = z.infer<typeof analysisReportDataSchema>
