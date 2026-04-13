import { z } from 'zod'

// === 포트폴리오 요약 ===

export const portfolioDataSchema = z.object({
  seedMoney: z.number(),
  cash: z.number(),
  stockValue: z.number(),
  totalAsset: z.number(),
  profitRate: z.number()
})

export const portfolioResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: portfolioDataSchema
})

// === 보유종목 상세 ===

export const holdingItemSchema = z.object({
  symbol: z.string(),
  stockName: z.string(),
  quantity: z.number().int().positive(),
  avgPrice: z.number(),
  currentPrice: z.number(),
  evalAmount: z.number(),
  profitRate: z.number()
})

export const holdingsResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.array(holdingItemSchema)
})

// === Type exports ===

export type PortfolioData = z.infer<typeof portfolioDataSchema>
export type PortfolioResponse = z.infer<typeof portfolioResponseSchema>
export type HoldingItem = z.infer<typeof holdingItemSchema>
export type HoldingsResponse = z.infer<typeof holdingsResponseSchema>
