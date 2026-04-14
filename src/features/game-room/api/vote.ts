import { baseApi } from '@/shared/api/base-api'

import { voteResponseSchema } from '../model/vote.schema'

export async function castVote(roomId: string, agree: boolean) {
  const response = await baseApi.post(`/rooms/${roomId}/votes`, { agree })
  return voteResponseSchema.parse(response.data)
}
