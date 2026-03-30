import { baseApi } from '@/shared/api/base-api'

import type { CreateRoomRequest } from '../model/game-room.schema'
import { createRoomResponseSchema, roomListResponseSchema } from '../model/game-room.schema'

export async function fetchGameRooms() {
  const response = await baseApi.get('/rooms')
  //const response = await baseApi.get('/mock/game-rooms.json')
  return roomListResponseSchema.parse(response.data)
}

export async function createGameRoom(request: CreateRoomRequest) {
  const response = await baseApi.post('/rooms', request)
  return createRoomResponseSchema.parse(response.data)
}
