import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const sourceSchema = z.object({
  publisherName: z.string(),
  url: z.string()
})

const stockSchema = z.object({
  code: z.string(),
  name: z.string()
})

const clusterItemSchema = z.object({
  clusterId: z.number(),
  title: z.string(),
  summary: z.string(),
  thumbnailUrl: z.string().nullable(),
  publishedAt: z.string(),
  sourceCount: z.number(),
  sources: z.array(sourceSchema),
  relatedStocks: z.array(stockSchema),
  marketTags: z.array(z.string()),
  isRead: z.boolean()
})

const clusterFeedSchema = z.object({
  items: z.array(clusterItemSchema),
  hasNext: z.boolean(),
  nextCursor: z.string().nullable()
})

export type ClusterItem = z.infer<typeof clusterItemSchema>
export type ClusterFeedResponse = z.infer<typeof clusterFeedSchema>

export type ClusterTab = 'ALL' | 'FINANCE' | 'TECH' | 'INDUSTRY' | 'ENERGY' | 'BIO' | 'CRYPTO'

export async function fetchNewsClusters(
  tab: ClusterTab,
  size: number,
  cursor?: string | null
): Promise<ClusterFeedResponse> {
  const params: Record<string, string | number> = { size }
  if (tab !== 'ALL') params.tab = tab
  if (cursor) params.cursor = cursor

  const response = await baseApi.get('/news/clusters', { params })
  const parsed = apiResponseSchema(clusterFeedSchema).parse(response.data)
  return parsed.data
}
