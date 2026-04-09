import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const articleSourceSchema = z.object({
  articleId: z.number(),
  title: z.string(),
  publisherName: z.string(),
  url: z.string()
})

const sectionSchema = z.object({
  sectionOrder: z.number(),
  heading: z.string(),
  body: z.string(),
  sourceCount: z.number(),
  sources: z.array(articleSourceSchema)
})

const stockSchema = z.object({
  code: z.string(),
  name: z.string()
})

const clusterDetailSchema = z.object({
  clusterId: z.number(),
  title: z.string(),
  summary: z.string(),
  thumbnailUrl: z.string().nullable(),
  publishedAt: z.string(),
  sourceCount: z.number(),
  sources: z.array(articleSourceSchema),
  relatedStocks: z.array(stockSchema),
  marketTags: z.array(z.string()),
  isRead: z.boolean(),
  sections: z.array(sectionSchema),
  articleContent: z.string().nullable().optional()
})

export type ClusterDetail = z.infer<typeof clusterDetailSchema>
export type ArticleSource = z.infer<typeof articleSourceSchema>
export type ClusterSection = z.infer<typeof sectionSchema>

export async function fetchClusterDetail(clusterId: number): Promise<ClusterDetail> {
  const response = await baseApi.get(`/news/clusters/${clusterId}`)
  const parsed = apiResponseSchema(clusterDetailSchema).parse(response.data)
  return parsed.data
}
