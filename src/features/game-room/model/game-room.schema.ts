import { z } from 'zod'

export const roomStatusSchema = z.enum(['WAITING', 'IN_PROGRESS', 'FINISHED'])

export const roomListItemSchema = z.object({
  roomId: z.uuid(),
  hostUserId: z.uuid(),
  seedMoney: z.number(),
  periodMonths: z.number(),
  moveDays: z.number(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  status: roomStatusSchema,
  currentPlayers: z.number(),
  createdAt: z.iso.datetime()
})

export const roomListResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.array(roomListItemSchema)
})

export const createRoomRequestSchema = z.object({
  seedMoney: z.number().int().min(1),
  periodMonths: z.number().int().min(1),
  moveDays: z.number().int().min(1)
})

export const createRoomResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.object({
    roomId: z.uuid(),
    status: roomStatusSchema
  })
})

// === API 3: 게임방 참가 ===

export const joinRoomResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.object({
    participantId: z.uuid(),
    roomId: z.uuid(),
    roomStatus: roomStatusSchema
  })
})

// === API 4: 게임방 상세 조회 ===

export const participantStatusSchema = z.enum(['ACTIVE', 'LEFT'])

export const participantDetailSchema = z.object({
  participantId: z.uuid(),
  userId: z.uuid(),
  userName: z.string(),
  isLeader: z.boolean(),
  status: participantStatusSchema,
  joinedAt: z.iso.datetime()
})

export const roomDetailResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.object({
    roomId: z.uuid(),
    hostId: z.uuid(),
    seed: z.number(),
    periodMonths: z.number(),
    moveDays: z.number(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    status: roomStatusSchema,
    participants: z.array(participantDetailSchema)
  })
})

// === API 5: 게임방 퇴장 ===

export const leaveRoomResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.object({
    message: z.string()
  })
})

// === API 6: 게임 시작 ===

export const turnDetailSchema = z.object({
  turnId: z.uuid(),
  turnNumber: z.number(),
  turnDate: z.iso.date()
})

export const startRoomResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.object({
    roomId: z.uuid(),
    status: roomStatusSchema,
    currentTurn: turnDetailSchema
  })
})

// === Type exports ===

export type RoomListItem = z.infer<typeof roomListItemSchema>
export type RoomListResponse = z.infer<typeof roomListResponseSchema>
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>
export type CreateRoomResponse = z.infer<typeof createRoomResponseSchema>
export type JoinRoomResponse = z.infer<typeof joinRoomResponseSchema>
export type ParticipantDetail = z.infer<typeof participantDetailSchema>
export type RoomDetailResponse = z.infer<typeof roomDetailResponseSchema>
export type LeaveRoomResponse = z.infer<typeof leaveRoomResponseSchema>
export type TurnDetail = z.infer<typeof turnDetailSchema>
export type StartRoomResponse = z.infer<typeof startRoomResponseSchema>
