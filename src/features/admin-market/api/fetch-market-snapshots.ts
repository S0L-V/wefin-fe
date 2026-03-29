import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const marketSnapshotSchema = z.object({
  metricType: z.string(),
  label: z.string(),
  value: z.number(),
  changeRate: z.number().nullable(),
  changeValue: z.number().nullable(),
  unit: z.string(),
  changeDirection: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable()
})

const marketSnapshotsResponseSchema = apiResponseSchema(z.array(marketSnapshotSchema))

export type MarketSnapshot = z.infer<typeof marketSnapshotSchema>

export async function fetchMarketSnapshots(): Promise<MarketSnapshot[]> {
  const response = await baseApi.get('/admin/market/snapshots')
  const parsed = marketSnapshotsResponseSchema.parse(response.data)
  return parsed.data
}
