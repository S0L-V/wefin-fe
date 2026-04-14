import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const insightCardSchema = z.object({
  headline: z.string(),
  body: z.string(),
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

const overviewSchema = z.object({
  generated: z.boolean(),
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
