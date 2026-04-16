import { z } from 'zod'

export const rankingItemSchema = z.object({
  rank: z.number().int().positive(),
  userId: z.string().uuid(),
  userName: z.string(),
  totalAsset: z.number(),
  profitRate: z.number()
})

export const rankingsResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: z.array(rankingItemSchema)
})

// === Type exports ===

export type RankingItem = z.infer<typeof rankingItemSchema>
export type RankingsResponse = z.infer<typeof rankingsResponseSchema>
