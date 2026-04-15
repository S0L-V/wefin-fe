import { z } from 'zod'

// === 투표 응답 ===

export const voteDataSchema = z.object({
  voted: z.boolean(),
  agreeCount: z.number().int().nonnegative(),
  disagreeCount: z.number().int().nonnegative(),
  totalCount: z.number().int().positive()
})

export const voteResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable(),
  message: z.string().nullable(),
  data: voteDataSchema
})

// === WebSocket 이벤트 ===

export const voteStartEventSchema = z.object({
  type: z.literal('VOTE_START'),
  initiator: z.string(),
  totalCount: z.number().int().positive(),
  timeoutSeconds: z.number().int().positive()
})

export const voteUpdateEventSchema = z.object({
  type: z.literal('VOTE_UPDATE'),
  agreeCount: z.number().int().nonnegative(),
  disagreeCount: z.number().int().nonnegative(),
  totalCount: z.number().int().positive()
})

export const voteResultEventSchema = z.object({
  type: z.literal('VOTE_RESULT'),
  passed: z.boolean(),
  agreeCount: z.number().int().nonnegative(),
  disagreeCount: z.number().int().nonnegative()
})

export const voteEventSchema = z.discriminatedUnion('type', [
  voteStartEventSchema,
  voteUpdateEventSchema,
  voteResultEventSchema
])

// === Type exports ===

export type VoteData = z.infer<typeof voteDataSchema>
export type VoteStartEvent = z.infer<typeof voteStartEventSchema>
export type VoteUpdateEvent = z.infer<typeof voteUpdateEventSchema>
export type VoteResultEvent = z.infer<typeof voteResultEventSchema>
export type VoteEvent = z.infer<typeof voteEventSchema>
