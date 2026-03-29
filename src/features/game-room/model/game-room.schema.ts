import { z } from 'zod'

export const roomListItemSchema = z.object({
  roomId: z.string(),
  hostUserId: z.string(),
  seedMoney: z.number(),
  periodMonths: z.number(),
  moveDays: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.string(),
  currentPlayers: z.number(),
  createdAt: z.string()
})

export const roomListResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.array(roomListItemSchema)
})

export const createRoomRequestSchema = z.object({
  seedMoney: z.number(),
  periodMonths: z.number(),
  moveDays: z.number()
})

export const createRoomResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.object({
    roomId: z.string(),
    status: z.string()
  })
})

export type RoomListItem = z.infer<typeof roomListItemSchema>
export type RoomListResponse = z.infer<typeof roomListResponseSchema>
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>
export type CreateRoomResponse = z.infer<typeof createRoomResponseSchema>
