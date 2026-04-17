import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const sectorInterestSchema = z.object({
  code: z.string(),
  name: z.string()
})

export type SectorInterest = z.infer<typeof sectorInterestSchema>

export async function fetchSectorInterests(): Promise<SectorInterest[]> {
  const response = await baseApi.get('/interests/sectors')
  const parsed = apiResponseSchema(z.array(sectorInterestSchema)).parse(response.data)
  return parsed.data
}

export async function addSectorInterest(code: string): Promise<void> {
  await baseApi.post(`/interests/sectors/${encodeURIComponent(code)}`)
}

export async function deleteSectorInterest(code: string): Promise<void> {
  await baseApi.delete(`/interests/sectors/${encodeURIComponent(code)}`)
}
