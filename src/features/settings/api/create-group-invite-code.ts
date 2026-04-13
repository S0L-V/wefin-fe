import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const createInviteCodeSchema = z.object({
  codeId: z.number(),
  groupId: z.number(),
  inviteCode: z.string(),
  status: z.string(),
  expiredAt: z.string()
})

export type CreateInviteCodeResult = z.infer<typeof createInviteCodeSchema>

export async function createGroupInviteCode(groupId: number): Promise<CreateInviteCodeResult> {
  const response = await baseApi.post(`/groups/${groupId}/invite-codes`)
  const parsed = apiResponseSchema(createInviteCodeSchema).parse(response.data)

  return parsed.data
}
