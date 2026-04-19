import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const reasonSchema = z.object({
  type: z.string(),
  count: z.number().nullable(),
  label: z.string()
})

const linkedClusterSchema = z.object({
  clusterId: z.number(),
  title: z.string()
})

const cardSchema = z.object({
  cardType: z.string(),
  interestCode: z.string(),
  interestName: z.string(),
  title: z.string(),
  summary: z.string(),
  context: z.string().nullable(),
  reasons: z.array(reasonSchema),
  linkedCluster: linkedClusterSchema.nullable()
})

const recommendedNewsSchema = z.object({
  cards: z.array(cardSchema),
  hasMore: z.boolean(),
  refreshCount: z.number(),
  refreshLimit: z.number()
})

export type RecommendedNews = z.infer<typeof recommendedNewsSchema>
export type RecommendedCard = z.infer<typeof cardSchema>

export async function fetchRecommendedNews(): Promise<RecommendedNews> {
  const response = await baseApi.get('/news/recommended', { timeout: 60_000 })
  const parsed = apiResponseSchema(recommendedNewsSchema).parse(response.data)
  return parsed.data
}

export async function refreshRecommendedNews(): Promise<RecommendedNews> {
  const response = await baseApi.post('/news/recommended/refresh', null, { timeout: 60_000 })
  const parsed = apiResponseSchema(recommendedNewsSchema).parse(response.data)
  return parsed.data
}
