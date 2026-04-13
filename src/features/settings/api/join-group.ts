import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const joinGroupRequestSchema = z.object({
  inviteCode: z.string().uuid()
})

const joinGroupResponseSchema = z.object({
  groupId: z.number(),
  groupName: z.string(),
  role: z.string(),
  status: z.string()
})

export type JoinGroupPayload = z.infer<typeof joinGroupRequestSchema>
export type JoinGroupResult = z.infer<typeof joinGroupResponseSchema>

export async function joinGroup(payload: JoinGroupPayload): Promise<JoinGroupResult> {
  const parsedPayload = joinGroupRequestSchema.parse(payload)

  const response = await baseApi.post('/groups/join', parsedPayload)
  const parsed = apiResponseSchema(joinGroupResponseSchema).parse(response.data)

  return parsed.data
}
