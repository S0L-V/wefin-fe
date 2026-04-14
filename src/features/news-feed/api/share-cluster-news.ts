import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const shareClusterNewsResponseSchema = apiResponseSchema(z.null())

export async function shareClusterNews(clusterId: number) {
  const response = await baseApi.post('/chat/group/news-share', {
    newsClusterId: clusterId
  })

  return shareClusterNewsResponseSchema.parse(response.data)
}
