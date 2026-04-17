import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

// --- Zod Schemas ---

export const priceSchema = z.object({
  stockCode: z.string(),
  currentPrice: z.number(),
  changePrice: z.number(),
  changeRate: z.number(),
  volume: z.number(),
  openPrice: z.number(),
  highPrice: z.number(),
  lowPrice: z.number()
})

export type PriceData = z.infer<typeof priceSchema>

const orderbookEntrySchema = z.object({
  price: z.number(),
  quantity: z.number()
})

export const orderbookSchema = z.object({
  asks: z.array(orderbookEntrySchema),
  bids: z.array(orderbookEntrySchema),
  totalAskQuantity: z.number(),
  totalBidQuantity: z.number()
})

export type OrderbookData = z.infer<typeof orderbookSchema>
export type OrderbookEntry = z.infer<typeof orderbookEntrySchema>

export const candleSchema = z.object({
  date: z.string(),
  openPrice: z.number(),
  highPrice: z.number(),
  lowPrice: z.number(),
  closePrice: z.number(),
  volume: z.number()
})

export type CandleData = z.infer<typeof candleSchema>

export const recentTradeSchema = z.object({
  tradeTime: z.string(),
  price: z.number(),
  changePrice: z.number(),
  changeSign: z.string(),
  changeRate: z.number(),
  volume: z.number(),
  tradeStrength: z.number()
})

export type RecentTradeData = z.infer<typeof recentTradeSchema>

export const stockInfoSchema = z.object({
  stockCode: z.string(),
  stockName: z.string(),
  market: z.string(),
  sector: z.string().nullable()
})

export type StockInfoData = z.infer<typeof stockInfoSchema>

// --- Fetch Functions ---

export async function fetchStockInfo(code: string): Promise<StockInfoData> {
  const response = await baseApi.get('/stocks/search', { params: { keyword: code } })
  const parsed = apiResponseSchema(z.array(stockInfoSchema)).parse(response.data)
  const match = parsed.data.find((s) => s.stockCode === code)
  if (!match) throw new Error(`Stock not found: ${code}`)
  return match
}

export async function fetchStockPrice(code: string): Promise<PriceData> {
  const response = await baseApi.get(`/stocks/${code}/price`)
  const parsed = apiResponseSchema(priceSchema).parse(response.data)
  return parsed.data
}

export async function fetchOrderbook(code: string): Promise<OrderbookData> {
  const response = await baseApi.get(`/stocks/${code}/orderbook`)
  const parsed = apiResponseSchema(orderbookSchema).parse(response.data)
  return parsed.data
}

export function formatSeoulDate(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date)
}

function getDefaultDateRange(periodCode: string): { start: string; end: string } {
  const end = new Date()
  const start = new Date()

  switch (periodCode) {
    case '1':
    case '5':
    case '15':
    case '30':
    case '60':
      start.setDate(end.getDate() - 7)
      break
    case 'D':
      start.setFullYear(end.getFullYear() - 1)
      break
    case 'W':
      start.setFullYear(end.getFullYear() - 1)
      break
    case 'M':
      start.setFullYear(end.getFullYear() - 3)
      break
    default:
      start.setMonth(end.getMonth() - 3)
  }

  return { start: formatSeoulDate(start), end: formatSeoulDate(end) }
}

export async function fetchCandles(code: string, periodCode: string = 'D'): Promise<CandleData[]> {
  const { start, end } = getDefaultDateRange(periodCode)
  const response = await baseApi.get(`/stocks/${code}/candles`, {
    params: { periodCode, start, end }
  })
  const parsed = apiResponseSchema(z.array(candleSchema)).parse(response.data)
  return parsed.data
}

export async function fetchCandlesByRange(
  code: string,
  periodCode: string,
  start: string,
  end: string
): Promise<CandleData[]> {
  const response = await baseApi.get(`/stocks/${code}/candles`, {
    params: { periodCode, start, end }
  })
  const parsed = apiResponseSchema(z.array(candleSchema)).parse(response.data)
  return parsed.data
}

export async function fetchRecentTrades(code: string): Promise<RecentTradeData[]> {
  const response = await baseApi.get(`/stocks/${code}/trades/recent`)
  const parsed = apiResponseSchema(z.array(recentTradeSchema)).parse(response.data)
  return parsed.data
}
