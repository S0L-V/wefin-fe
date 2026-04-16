import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const indexCodeSchema = z.enum(['KOSPI', 'KOSDAQ', 'NASDAQ', 'SP500'])
export const changeDirectionSchema = z.enum(['UP', 'DOWN', 'FLAT'])
export const marketStatusSchema = z.enum(['OPEN', 'CLOSED', 'PRE_OPEN'])

export const sparklinePointSchema = z.object({
  t: z.string(),
  v: z.number()
})

export const marketIndexSchema = z.object({
  code: indexCodeSchema,
  name: z.string(),
  currentValue: z.number(),
  changeValue: z.number(),
  changeRate: z.number(),
  changeDirection: changeDirectionSchema,
  isDelayed: z.boolean(),
  marketStatus: marketStatusSchema,
  sparkline: z.array(sparklinePointSchema)
})

export const marketIndicesResponseSchema = z.object({
  updatedAt: z.string(),
  indices: z.array(marketIndexSchema)
})

export type IndexCode = z.infer<typeof indexCodeSchema>
export type ChangeDirection = z.infer<typeof changeDirectionSchema>
export type MarketStatus = z.infer<typeof marketStatusSchema>
export type SparklinePoint = z.infer<typeof sparklinePointSchema>
export type MarketIndex = z.infer<typeof marketIndexSchema>
export type MarketIndicesResponse = z.infer<typeof marketIndicesResponseSchema>

export type IndexInterval = '1m' | '5m' | '15m'

export interface MarketIndicesParams {
  interval?: IndexInterval
  sparklinePoints?: number
}

export async function fetchMarketIndices(
  params: MarketIndicesParams = {}
): Promise<MarketIndicesResponse> {
  const response = await baseApi.get('/market/indices', { params })
  return apiResponseSchema(marketIndicesResponseSchema).parse(response.data).data
}
