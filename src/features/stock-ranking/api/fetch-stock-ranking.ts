import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

import type { RankingTab } from '../lib/ranking-data'

const TAB_TO_TYPE: Record<RankingTab, 'VOLUME' | 'AMOUNT' | 'RISING' | 'FALLING'> = {
  volume: 'VOLUME',
  amount: 'AMOUNT',
  rising: 'RISING',
  falling: 'FALLING'
}

export const stockRankingItemSchema = z.object({
  rank: z.number(),
  stockCode: z.string(),
  stockName: z.string(),
  currentPrice: z.number(),
  changeRate: z.number(),
  changeAmount: z.number(),
  changeSign: z.string(),
  volume: z.number()
})

export const stockRankingResponseSchema = z.object({
  items: z.array(stockRankingItemSchema)
})

export type StockRankingItem = z.infer<typeof stockRankingItemSchema>
export type StockRankingResponse = z.infer<typeof stockRankingResponseSchema>

export async function fetchStockRanking(tab: RankingTab, limit = 30): Promise<StockRankingItem[]> {
  const response = await baseApi.get('/stocks/ranking', {
    params: { type: TAB_TO_TYPE[tab], limit }
  })
  return apiResponseSchema(stockRankingResponseSchema).parse(response.data).data.items
}
