import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const popularTagSchema = z.object({
  code: z.string(),
  name: z.string(),
  clusterCount: z.number()
})

export type PopularTag = z.infer<typeof popularTagSchema>

export async function fetchPopularTags(type: 'SECTOR' | 'STOCK'): Promise<PopularTag[]> {
  const response = await baseApi.get('/news/tags/popular', {
    params: { type, limit: 0 }
  })
  const parsed = apiResponseSchema(z.array(popularTagSchema)).parse(response.data)
  return parsed.data
}
