import { baseApi } from '@/shared/api/base-api'

import { gameEndResponseSchema } from '../model/game-end.schema'

export async function endGame(roomId: string) {
  const response = await baseApi.post(`/rooms/${roomId}/end`)
  return gameEndResponseSchema.parse(response.data)
}
