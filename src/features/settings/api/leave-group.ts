import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const leaveGroupSchema = z.object({
  leftGroupId: z.number(),
  currentGroupId: z.number()
})

export type LeaveGroupResult = z.infer<typeof leaveGroupSchema>

export async function leaveGroup(groupId: number): Promise<LeaveGroupResult> {
  const response = await baseApi.delete(`/groups/${groupId}/members/me`)
  const parsed = apiResponseSchema(leaveGroupSchema).parse(response.data)

  return parsed.data
}
