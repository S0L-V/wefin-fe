import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const rankingItemSchema = z.object({
  rank: z.number(),
  nickname: z.string().nullable(),
  realizedProfit: z.number().nullable(),
  tradeCount: z.number()
})

export const myRankSchema = z.object({
  rank: z.number(),
  realizedProfit: z.number().nullable()
})

export const dailyRankingResponseSchema = z.object({
  rankings: z.array(rankingItemSchema),
  myRank: myRankSchema.nullable()
})

export type RankingItem = z.infer<typeof rankingItemSchema>
export type MyRank = z.infer<typeof myRankSchema>
export type DailyRankingResponse = z.infer<typeof dailyRankingResponseSchema>

export async function fetchDailyRanking(): Promise<DailyRankingResponse> {
  const response = await baseApi.get('/ranking/daily')
  return apiResponseSchema(dailyRankingResponseSchema).parse(response.data).data
}
