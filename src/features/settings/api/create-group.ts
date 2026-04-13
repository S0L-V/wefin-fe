import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const createGroupRequestSchema = z.object({
  name: z.string().trim().min(1)
})

const createGroupResponseSchema = z.object({
  groupId: z.number(),
  groupName: z.string(),
  role: z.string()
})

export type CreateGroupPayload = z.infer<typeof createGroupRequestSchema>
export type CreateGroupResult = z.infer<typeof createGroupResponseSchema>

export async function createGroup(payload: CreateGroupPayload): Promise<CreateGroupResult> {
  const parsedPayload = createGroupRequestSchema.parse(payload)

  const response = await baseApi.post('/groups', parsedPayload)
  const parsed = apiResponseSchema(createGroupResponseSchema).parse(response.data)

  return parsed.data
}
