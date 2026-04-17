import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

const voteResultOptionSchema = z.object({
  optionId: z.number(),
  optionText: z.string(),
  voteCount: z.number(),
  rate: z.number(),
  selectedByMe: z.boolean()
})

const voteResultSchema = z.object({
  voteId: z.number(),
  title: z.string(),
  status: z.string(),
  maxSelectCount: z.number(),
  endsAt: z.string().nullable(),
  closed: z.boolean(),
  participantCount: z.number(),
  options: z.array(voteResultOptionSchema)
})

const apiResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  data: voteResultSchema
})

export type SubmitVoteInput = {
  optionIds: number[]
}

export type SubmitVoteResult = z.infer<typeof voteResultSchema>

export async function submitVote(
  voteId: number,
  input: SubmitVoteInput
): Promise<SubmitVoteResult> {
  const response = await baseApi.post(`/votes/${voteId}/answers`, input)
  const parsed = apiResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    console.error('vote submit response parse failed', parsed.error.flatten())
    throw parsed.error
  }

  return parsed.data.data
}
