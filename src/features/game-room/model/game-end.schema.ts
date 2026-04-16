import { z } from 'zod'

export const gameEndDataSchema = z.object({
  participantId: z.uuid(),
  finalAsset: z.number(),
  profitRate: z.number(),
  totalTrades: z.number().int().nonnegative(),
  roomFinished: z.boolean()
})

export const gameEndResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: gameEndDataSchema
})

export type GameEndData = z.infer<typeof gameEndDataSchema>
