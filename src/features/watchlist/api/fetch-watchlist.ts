import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const watchlistItemSchema = z.object({
  stockCode: z.string(),
  stockName: z.string(),
  currentPrice: z.number(),
  changeRate: z.number()
})

export type WatchlistItem = z.infer<typeof watchlistItemSchema>

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const response = await baseApi.get('/watchlist')
  const parsed = apiResponseSchema(z.array(watchlistItemSchema)).parse(response.data)
  return parsed.data
}

export async function addWatchlistItem(code: string): Promise<void> {
  await baseApi.post(`/watchlist/${code}`)
}

export async function deleteWatchlistItem(code: string): Promise<void> {
  await baseApi.delete(`/watchlist/${code}`)
}
