import { baseApi } from '@/shared/api/base-api'

import { turnAdvanceResponseSchema } from '../model/game-room.schema'

export async function advanceTurn(roomId: string) {
  const response = await baseApi.post(`/rooms/${roomId}/turns/next`)
  return turnAdvanceResponseSchema.parse(response.data)
}
