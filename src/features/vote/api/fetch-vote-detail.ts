import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

const voteDetailOptionSchema = z.object({
  optionId: z.number(),
  optionText: z.string()
})

const voteDetailSchema = z.object({
  voteId: z.number(),
  title: z.string(),
  status: z.string(),
  maxSelectCount: z.number(),
  endsAt: z.string().nullable(),
  closed: z.boolean(),
  options: z.array(voteDetailOptionSchema),
  myOptionIds: z.array(z.number())
})

const apiResponseSchema = z.object({
  status: z.number(),
  code: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  data: voteDetailSchema
})

export type VoteDetail = z.infer<typeof voteDetailSchema>

export async function fetchVoteDetail(voteId: number): Promise<VoteDetail> {
  const response = await baseApi.get(`/votes/${voteId}`)
  const parsed = apiResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    console.error('vote detail response parse failed', parsed.error.flatten())
    throw parsed.error
  }

  return parsed.data.data
}
