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

export const participantStatusSchema = z.enum(['ACTIVE', 'LEFT', 'FINISHED'])

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

// === API: 현재 턴 조회 ===

export const turnStatusSchema = z.enum(['ACTIVE', 'COMPLETED'])

export const currentTurnDataSchema = z.object({
  turnId: z.uuid(),
  turnNumber: z.number().int().min(1),
  turnDate: z.iso.date(),
  status: turnStatusSchema,
  briefingId: z.uuid().nullable()
})

export const currentTurnResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: currentTurnDataSchema
})

// === API: 턴 전환 ===

export const turnAdvanceDataSchema = z.discriminatedUnion('gameFinished', [
  z.object({
    gameFinished: z.literal(false),
    turnId: z.uuid(),
    turnNumber: z.number().int().min(1),
    turnDate: z.iso.date(),
    briefingId: z.uuid().nullable()
  }),
  z.object({
    gameFinished: z.literal(true),
    turnId: z.null(),
    turnNumber: z.null(),
    turnDate: z.null(),
    briefingId: z.null()
  })
])

export const turnAdvanceResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: turnAdvanceDataSchema
})

// === API: 과거 게임 이력 조회 ===

export const pageInfoSchema = z.object({
  page: z.number().int().min(0),
  size: z.number().int().min(1),
  totalElements: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean()
})

export const gameHistoryItemSchema = z.object({
  roomId: z.uuid(),
  roomStatus: roomStatusSchema,
  seedMoney: z.number(),
  periodMonths: z.number().int(),
  moveDays: z.number().int(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  participantCount: z.number().int(),
  finalAsset: z.number(),
  profitRate: z.number(),
  finalRank: z.number().int().nullable(),
  totalTrades: z.number().int(),
  finishedAt: z.iso.datetime()
})

export const gameHistoryResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.object({
    content: z.array(gameHistoryItemSchema),
    pageInfo: pageInfoSchema
  })
})

// === Type exports ===

export type TurnAdvanceData = z.infer<typeof turnAdvanceDataSchema>
export type TurnAdvanceResponse = z.infer<typeof turnAdvanceResponseSchema>
export type CurrentTurnData = z.infer<typeof currentTurnDataSchema>
export type CurrentTurnResponse = z.infer<typeof currentTurnResponseSchema>
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
export type PageInfo = z.infer<typeof pageInfoSchema>
export type GameHistoryItem = z.infer<typeof gameHistoryItemSchema>
export type GameHistoryResponse = z.infer<typeof gameHistoryResponseSchema>
