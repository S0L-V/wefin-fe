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

export type RoomListItem = z.infer<typeof roomListItemSchema>
export type RoomListResponse = z.infer<typeof roomListResponseSchema>
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>
export type CreateRoomResponse = z.infer<typeof createRoomResponseSchema>
