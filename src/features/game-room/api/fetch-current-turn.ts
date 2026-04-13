import { baseApi } from '@/shared/api/base-api'

import { currentTurnResponseSchema } from '../model/game-room.schema'

export async function fetchCurrentTurn(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}/turns/current`)
  return currentTurnResponseSchema.parse(response.data)
}
