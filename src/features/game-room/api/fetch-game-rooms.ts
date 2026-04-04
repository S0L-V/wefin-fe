import { baseApi } from '@/shared/api/base-api'

import type { CreateRoomRequest } from '../model/game-room.schema'
import {
  createRoomResponseSchema,
  joinRoomResponseSchema,
  leaveRoomResponseSchema,
  roomDetailResponseSchema,
  roomListResponseSchema,
  startRoomResponseSchema
} from '../model/game-room.schema'

// API 1: 게임방 목록 조회
export async function fetchGameRooms() {
  const response = await baseApi.get('/rooms')
  return roomListResponseSchema.parse(response.data)
}

// API 2: 게임방 생성
export async function createGameRoom(request: CreateRoomRequest) {
  const response = await baseApi.post('/rooms', request)
  return createRoomResponseSchema.parse(response.data)
}

// API 3: 게임방 참가
export async function joinGameRoom(roomId: string) {
  const response = await baseApi.post(`/rooms/${roomId}/join`)
  return joinRoomResponseSchema.parse(response.data)
}

// API 4: 게임방 상세 조회
export async function fetchGameRoomDetail(roomId: string) {
  const response = await baseApi.get(`/rooms/${roomId}`)
  return roomDetailResponseSchema.parse(response.data)
}

// API 5: 게임방 퇴장
export async function leaveGameRoom(roomId: string) {
  const response = await baseApi.delete(`/rooms/${roomId}/leave`)
  return leaveRoomResponseSchema.parse(response.data)
}

// API 6: 게임 시작
export async function startGameRoom(roomId: string) {
  const response = await baseApi.post(`/rooms/${roomId}/start`)
  return startRoomResponseSchema.parse(response.data)
}
