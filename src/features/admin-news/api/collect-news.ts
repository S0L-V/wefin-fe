import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const collectNewsResponseSchema = apiResponseSchema(z.string())

export async function collectNews() {
  const response = await baseApi.post('/admin/news/collect')
  return collectNewsResponseSchema.parse(response.data)
}

export async function crawlNews() {
  const response = await baseApi.post('/admin/news/crawl')
  return collectNewsResponseSchema.parse(response.data)
}
