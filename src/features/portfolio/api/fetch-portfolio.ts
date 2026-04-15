import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const portfolioItemSchema = z.object({
  stockName: z.string().nullable(),
  stockCode: z.string().nullable(),
  quantity: z.number().nullable(),
  avgPrice: z.number().nullable(),
  currentPrice: z.number().nullable(),
  evaluationAmount: z.number().nullable(),
  profitLoss: z.number().nullable(),
  profitRate: z.number().nullable()
})

export type PortfolioItem = z.infer<typeof portfolioItemSchema>

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  const response = await baseApi.get('/portfolio')
  return apiResponseSchema(z.array(portfolioItemSchema)).parse(response.data).data
}
