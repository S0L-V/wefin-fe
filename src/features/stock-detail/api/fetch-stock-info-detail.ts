import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

// --- Zod Schemas (BE WEF-645 응답 — 5 섹션 composition) ---

const dartCompanyInfoSchema = z.object({
  corpName: z.string().nullable(),
  corpNameEng: z.string().nullable(),
  stockName: z.string().nullable(),
  stockCode: z.string().nullable(),
  ceoName: z.string().nullable(),
  address: z.string().nullable(),
  homepageUrl: z.string().nullable(),
  irUrl: z.string().nullable(),
  phoneNo: z.string().nullable(),
  faxNo: z.string().nullable(),
  indutyCode: z.string().nullable(),
  establishedDate: z.string().nullable(),
  accountingMonth: z.string().nullable()
})

const dartFinancialPeriodSchema = z.object({
  periodName: z.string().nullable(),
  totalAssets: z.number().nullable(),
  totalLiabilities: z.number().nullable(),
  totalEquity: z.number().nullable(),
  revenue: z.number().nullable(),
  operatingIncome: z.number().nullable(),
  netIncome: z.number().nullable()
})

const dartFinancialSummarySchema = z.object({
  businessYear: z.string().nullable(),
  reportCode: z.string().nullable(),
  currency: z.string().nullable(),
  currentPeriod: dartFinancialPeriodSchema.nullable(),
  previousPeriod: dartFinancialPeriodSchema.nullable(),
  prePreviousPeriod: dartFinancialPeriodSchema.nullable()
})

const stockBasicInfoSchema = z.object({
  marketCapInHundredMillionKrw: z.number().nullable(),
  listedShares: z.number().nullable(),
  foreignRatio: z.number().nullable()
})

const stockIndicatorInfoSchema = z.object({
  per: z.number().nullable(),
  pbr: z.number().nullable(),
  eps: z.number().nullable(),
  roe: z.number().nullable()
})

const dartDividendInfoSchema = z.object({
  businessYear: z.string().nullable(),
  dividendPerShare: z.number().nullable(),
  dividendYieldRate: z.number().nullable(),
  payoutRatio: z.number().nullable()
})

export const stockInfoDetailSchema = z.object({
  company: dartCompanyInfoSchema.nullable(),
  financial: dartFinancialSummarySchema.nullable(),
  basic: stockBasicInfoSchema.nullable(),
  indicator: stockIndicatorInfoSchema.nullable(),
  dividend: dartDividendInfoSchema.nullable()
})

export type StockInfoDetailData = z.infer<typeof stockInfoDetailSchema>
export type DartCompanyInfo = z.infer<typeof dartCompanyInfoSchema>
export type DartFinancialSummary = z.infer<typeof dartFinancialSummarySchema>
export type DartFinancialPeriod = z.infer<typeof dartFinancialPeriodSchema>
export type StockBasicInfo = z.infer<typeof stockBasicInfoSchema>
export type StockIndicatorInfo = z.infer<typeof stockIndicatorInfoSchema>
export type DartDividendInfo = z.infer<typeof dartDividendInfoSchema>

// --- Fetch ---

export async function fetchStockInfoDetail(code: string): Promise<StockInfoDetailData> {
  const response = await baseApi.get(`/stocks/${code}/info`)
  const parsed = apiResponseSchema(stockInfoDetailSchema).parse(response.data)
  return parsed.data
}
