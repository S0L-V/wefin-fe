import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const collectMarketResponseSchema = apiResponseSchema(z.string())

export type CollectMarketResponse = z.infer<typeof collectMarketResponseSchema>

export async function collectMarketData(): Promise<CollectMarketResponse> {
  const response = await baseApi.post('/admin/market/collect')
  return collectMarketResponseSchema.parse(response.data)
}
