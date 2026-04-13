import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { ApiError, baseApi } from '@/shared/api/base-api'

const groupInviteCodeSchema = z.object({
  codeId: z.number(),
  groupId: z.number(),
  inviteCode: z.string(),
  status: z.string(),
  expiredAt: z.string()
})

export type GroupInviteCode = z.infer<typeof groupInviteCodeSchema>

export async function getGroupInviteCode(groupId: number): Promise<GroupInviteCode | null> {
  try {
    const response = await baseApi.get(`/groups/${groupId}/invite-codes/latest`)
    const parsed = apiResponseSchema(groupInviteCodeSchema).parse(response.data)
    return parsed.data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}
