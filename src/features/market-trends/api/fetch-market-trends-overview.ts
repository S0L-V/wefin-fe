import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const insightCardSchema = z.object({
  headline: z.string(),
  body: z.string(),
  /** personalized 응답에서만 채워지는 사용자 행동 가이드. overview는 null */
  advice: z.string().nullable().optional(),
  /** "오늘의 제안" / "투자 힌트" 중 하나. overview는 null */
  adviceLabel: z.string().nullable().optional(),
  relatedClusterIds: z.array(z.number())
})

const sourceClusterSchema = z.object({
  clusterId: z.number(),
  title: z.string(),
  publishedAt: z.string()
})

const metricTypeSchema = z.enum(['KOSPI', 'NASDAQ', 'BASE_RATE', 'USD_KRW'])
const changeDirectionSchema = z.enum(['UP', 'DOWN', 'FLAT'])

const marketSnapshotSchema = z.object({
  metricType: metricTypeSchema,
  label: z.string(),
  value: z.number(),
  changeRate: z.number().nullable(),
  changeValue: z.number().nullable(),
  unit: z.string(),
  changeDirection: changeDirectionSchema
})

export type MetricType = z.infer<typeof metricTypeSchema>
export type ChangeDirection = z.infer<typeof changeDirectionSchema>

const personalizationModeSchema = z.enum(['MATCHED', 'ACTION_BRIEFING', 'OVERVIEW_FALLBACK'])
export type PersonalizationMode = z.infer<typeof personalizationModeSchema>

const overviewSchema = z.object({
  generated: z.boolean(),
  /** mode === 'MATCHED' 와 동치. 호환용 boolean */
  personalized: z.boolean().optional().default(false),
  /**
   * personalized 엔드포인트 응답에서만 의미를 가짐. overview 엔드포인트 응답은 항상 null.
   * - MATCHED — 관심사 매칭 맞춤 분석
   * - ACTION_BRIEFING — 매칭 0건이라 일반 시장 액션 분석
   * - OVERVIEW_FALLBACK — personalized 시도했으나 overview 콘텐츠 재사용
   */
  mode: personalizationModeSchema.nullable().optional(),
  trendDate: z.string().nullable(),
  title: z.string().nullable(),
  summary: z.string().nullable(),
  insightCards: z.array(insightCardSchema),
  relatedKeywords: z.array(z.string()),
  sourceClusters: z.array(sourceClusterSchema),
  sourceClusterCount: z.number(),
  sourceArticleCount: z.number(),
  updatedAt: z.string().nullable(),
  marketSnapshots: z.array(marketSnapshotSchema)
})

export type InsightCard = z.infer<typeof insightCardSchema>
export type SourceCluster = z.infer<typeof sourceClusterSchema>
export type MarketSnapshot = z.infer<typeof marketSnapshotSchema>
export type MarketTrendsOverview = z.infer<typeof overviewSchema>

export async function fetchMarketTrendsOverview(): Promise<MarketTrendsOverview> {
  const response = await baseApi.get('/market-trends/overview')
  const parsed = apiResponseSchema(overviewSchema).safeParse(response.data)
  if (!parsed.success) {
    console.error('시장 동향 응답 파싱 실패:', parsed.error.flatten())
    throw parsed.error
  }
  return parsed.data.data
}

export async function fetchPersonalizedMarketTrends(): Promise<MarketTrendsOverview> {
  // OpenAI 호출이 포함돼 응답까지 10~30초가 걸릴 수 있어 baseApi 기본 timeout(5s)을 override한다
  const response = await baseApi.get('/market-trends/personalized', { timeout: 60_000 })
  const parsed = apiResponseSchema(overviewSchema).safeParse(response.data)
  if (!parsed.success) {
    console.error('맞춤 시장 동향 응답 파싱 실패:', parsed.error.flatten())
    throw parsed.error
  }
  return parsed.data.data
}

/**
 * TTL(30분) 내 캐시가 있을 때만 결과를 반환한다. AI 재생성은 발생하지 않는다.
 *
 * 페이지 진입 시 이전 분석 결과가 fresh면 자동으로 화면에 복원하기 위해 사용한다.
 * 캐시 miss/stale 시 서버가 {@code data=null}을 반환하며 본 함수도 {@code null}을 반환한다
 */
export async function fetchPersonalizedMarketTrendsCached(): Promise<MarketTrendsOverview | null> {
  const response = await baseApi.get('/market-trends/personalized', {
    params: { cacheOnly: true }
  })
  const parsed = apiResponseSchema(overviewSchema.nullable()).safeParse(response.data)
  if (!parsed.success) {
    console.error('맞춤 시장 동향(캐시) 응답 파싱 실패:', parsed.error.flatten())
    throw parsed.error
  }
  return parsed.data.data
}
