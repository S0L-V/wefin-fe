import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const stockSearchSchema = z.object({
  stockCode: z.string(),
  stockName: z.string(),
  market: z.string(),
  sector: z.string().nullable()
})

export type StockSearchResult = z.infer<typeof stockSearchSchema>

export async function fetchStockSearch(keyword: string): Promise<StockSearchResult[]> {
  const response = await baseApi.get('/stocks/search', { params: { keyword } })
  const parsed = apiResponseSchema(z.array(stockSearchSchema)).parse(response.data)
  return parsed.data
}
