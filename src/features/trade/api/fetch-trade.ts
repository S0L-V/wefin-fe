import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const tradeSideSchema = z.enum(['BUY', 'SELL'])

export const tradeHistoryResponseSchema = z.object({
  tradeId: z.number(),
  tradeNo: z.string(),
  stockCode: z.string().nullable(),
  stockName: z.string().nullable(),
  side: tradeSideSchema,
  quantity: z.number(),
  price: z.number().nullable(),
  totalAmount: z.number().nullable(),
  fee: z.number().nullable(),
  tax: z.number().nullable(),
  realizedProfit: z.number().nullable(),
  createdAt: z.string().nullable()
})

export type TradeSide = z.infer<typeof tradeSideSchema>
export type TradeHistoryResponse = z.infer<typeof tradeHistoryResponseSchema>

const cursorTradeSchema = z.object({
  content: z.array(tradeHistoryResponseSchema),
  nextCursor: z.number().nullable(),
  hasNext: z.boolean()
})

export interface CursorTradeResponse {
  content: TradeHistoryResponse[]
  nextCursor: number | null
  hasNext: boolean
}

export interface TradeHistoryParams {
  stockCode?: string
  side?: TradeSide
  startDate?: string
  endDate?: string
  cursor?: number
  size?: number
}

export async function fetchTradeHistory(
  params: TradeHistoryParams = {}
): Promise<CursorTradeResponse> {
  const response = await baseApi.get('/trade/history', { params })
  return apiResponseSchema(cursorTradeSchema).parse(response.data).data
}
