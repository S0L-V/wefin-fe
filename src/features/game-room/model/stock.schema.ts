import { z } from 'zod'

// 금액/수량 필드 공통 제약:
//   - 음수 불가 (OHLCV는 항상 0 이상)
//   - JS 정수 안전 범위 이내 (BigDecimal → number 역직렬화 시 정밀도 손실 방지)
const nonNegativeSafeNumber = z.number().nonnegative().max(Number.MAX_SAFE_INTEGER)

// === 종목 검색 ===

export const stockSearchItemSchema = z.object({
  symbol: z.string(),
  stockName: z.string(),
  market: z.enum(['KOSPI', 'KOSDAQ']),
  price: nonNegativeSafeNumber
})

export const stockSearchResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.array(stockSearchItemSchema)
})

// === 차트 조회 ===

export const chartItemSchema = z.object({
  tradeDate: z.iso.date(),
  openPrice: nonNegativeSafeNumber,
  highPrice: nonNegativeSafeNumber,
  lowPrice: nonNegativeSafeNumber,
  closePrice: nonNegativeSafeNumber,
  volume: nonNegativeSafeNumber,
  changeRate: z.number().nullable()
})

export const chartResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.array(chartItemSchema)
})

// === Type exports ===

export type StockSearchItem = z.infer<typeof stockSearchItemSchema>
export type StockSearchResponse = z.infer<typeof stockSearchResponseSchema>
export type ChartItem = z.infer<typeof chartItemSchema>
export type ChartResponse = z.infer<typeof chartResponseSchema>
