import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

const voteResponseSchema = z.object({
  voteId: z.number(),
  title: z.string(),
  status: z.string(),
  maxSelectCount: z.number(),
  endsAt: z.string().nullable()
})

const apiResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  data: voteResponseSchema
})

export type CreateVoteInput = {
  groupId: number
  title: string
  options: string[]
  maxSelectCount: number
  durationHours: number
}

export type CreateVoteResult = z.infer<typeof voteResponseSchema>

export async function createVote(input: CreateVoteInput): Promise<CreateVoteResult> {
  const response = await baseApi.post('/votes', input)
  const parsed = apiResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    console.error('투표 생성 응답 파싱 실패', parsed.error.flatten())
    throw parsed.error
  }

  return parsed.data.data
}
