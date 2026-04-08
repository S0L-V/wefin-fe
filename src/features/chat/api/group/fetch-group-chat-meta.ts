import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

export type GroupChatMeta = {
  groupId: number
  groupName: string
}

const groupChatMetaSchema = z.object({
  groupId: z.number(),
  groupName: z.string()
})

const apiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    status: z.number(),
    code: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    data: schema
  })

export async function fetchGroupChatMeta(): Promise<GroupChatMeta> {
  const response = await baseApi.get('/chat/group/me')
  const parsed = apiResponseSchema(groupChatMetaSchema).parse(response.data)
  return parsed.data
}
