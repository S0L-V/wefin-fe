import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const investorTrendItemSchema = z.object({
  date: z.string().nullable(),
  closePrice: z.number(),
  priceChange: z.number(),
  foreignNetBuy: z.number(),
  institutionNetBuy: z.number(),
  individualNetBuy: z.number()
})

export const investorTrendSchema = z.object({
  stockCode: z.string(),
  items: z.array(investorTrendItemSchema)
})

export type InvestorTrendData = z.infer<typeof investorTrendSchema>
export type InvestorTrendItem = z.infer<typeof investorTrendItemSchema>

export async function fetchInvestorTrend(code: string): Promise<InvestorTrendData> {
  const response = await baseApi.get(`/stocks/${code}/investor-trend`)
  const parsed = apiResponseSchema(investorTrendSchema).parse(response.data)
  return parsed.data
}
