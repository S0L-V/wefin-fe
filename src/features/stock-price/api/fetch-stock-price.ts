import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const stockPriceSchema = z.object({
  stockCode: z.string(),
  currentPrice: z.number(),
  changePrice: z.number(),
  changeRate: z.number(),
  volume: z.number().optional(),
  openPrice: z.number().optional(),
  highPrice: z.number().optional(),
  lowPrice: z.number().optional()
})

export type StockPrice = z.infer<typeof stockPriceSchema>

export async function fetchStockPrice(code: string): Promise<StockPrice> {
  const response = await baseApi.get(`/stocks/${code}/price`)
  const parsed = apiResponseSchema(stockPriceSchema).parse(response.data)
  return parsed.data
}
