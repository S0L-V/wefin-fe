import { baseApi } from '@/shared/api/base-api'

import { rankingsResponseSchema } from '../model/ranking.schema'

export async function fetchRankings(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}/rankings`)
  return rankingsResponseSchema.parse(response.data)
}
