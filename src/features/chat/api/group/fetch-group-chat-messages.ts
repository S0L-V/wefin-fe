import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

const isDev = import.meta.env.DEV

export const replyMessageSchema = z.object({
  messageId: z.number(),
  sender: z.string(),
  content: z.string()
})

export const groupChatMessageSchema = z.object({
  messageId: z.number(),
  userId: z.string().nullable(),
  groupId: z.number(),
  messageType: z.enum(['CHAT', 'MEMO', 'SYSTEM']),
  sender: z.string(),
  content: z.string(),
  createdAt: z.string(),
  replyTo: replyMessageSchema.nullable()
})

export type ReplyMessage = z.infer<typeof replyMessageSchema>
export type GroupChatMessage = z.infer<typeof groupChatMessageSchema>

const apiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    status: z.number(),
    code: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    data: schema
  })

export async function fetchGroupChatMessages(
  userId: string,
  limit = 50
): Promise<GroupChatMessage[]> {
  const response = await baseApi.get('/chat/group/messages', {
    params: { limit },
    headers: {
      'X-User-Id': userId
    }
  })

  const parsed = apiResponseSchema(z.array(groupChatMessageSchema)).safeParse(response.data)

  if (!parsed.success) {
    if (isDev) {
      console.error('그룹 채팅 응답 파싱 실패:', parsed.error.flatten())
    } else {
      console.error('그룹 채팅 응답 파싱 실패')
    }
    throw parsed.error
  }

  return parsed.data.data
}
