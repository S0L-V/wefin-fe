import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

// --- News (BE WEF-413/414) ---

const newsSourceSchema = z.object({
  publisherName: z.string().nullable(),
  url: z.string().nullable()
})

const newsItemSchema = z.object({
  clusterId: z.number().nullable(),
  title: z.string().nullable(),
  summary: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  publishedAt: z.string().nullable(),
  sourceCount: z.number().nullable(),
  sources: z.array(newsSourceSchema)
})

export const stockNewsSchema = z.object({
  items: z.array(newsItemSchema),
  hasNext: z.boolean(),
  nextCursor: z.string().nullable()
})

export type StockNewsData = z.infer<typeof stockNewsSchema>
export type StockNewsItem = z.infer<typeof newsItemSchema>
export type StockNewsSource = z.infer<typeof newsSourceSchema>

export async function fetchStockNews(code: string): Promise<StockNewsData> {
  const response = await baseApi.get(`/stocks/${code}/news`)
  const parsed = apiResponseSchema(stockNewsSchema).parse(response.data)
  return parsed.data
}

// --- Disclosures (BE WEF-648) ---

const disclosureItemSchema = z.object({
  receiptNo: z.string().nullable(),
  reportName: z.string().nullable(),
  receiptDate: z.string().nullable(),
  filerName: z.string().nullable(),
  viewerUrl: z.string().nullable()
})

export const stockDisclosuresSchema = z.object({
  items: z.array(disclosureItemSchema),
  totalCount: z.number().nullable()
})

export type StockDisclosuresData = z.infer<typeof stockDisclosuresSchema>
export type StockDisclosureItem = z.infer<typeof disclosureItemSchema>

export async function fetchStockDisclosures(code: string): Promise<StockDisclosuresData> {
  const response = await baseApi.get(`/stocks/${code}/disclosures`)
  const parsed = apiResponseSchema(stockDisclosuresSchema).parse(response.data)
  return parsed.data
}
