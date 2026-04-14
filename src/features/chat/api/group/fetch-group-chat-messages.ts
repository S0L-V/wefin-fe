import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

const isDev = import.meta.env.DEV
const PAGE_SIZE = 30

export const replyMessageSchema = z.object({
  messageId: z.number(),
  sender: z.string(),
  content: z.string()
})

export const newsShareSchema = z.object({
  newsClusterId: z.number(),
  title: z.string(),
  summary: z.string().nullable(),
  thumbnailUrl: z.string().nullable()
})

export const groupChatMessageSchema = z.object({
  messageId: z.number(),
  userId: z.string().nullable(),
  groupId: z.number(),
  messageType: z.enum(['CHAT', 'NEWS', 'SYSTEM']),
  sender: z.string(),
  content: z.string(),
  createdAt: z.string(),
  replyTo: replyMessageSchema.nullable(),
  newsShare: newsShareSchema.nullable().optional()
})

const groupChatMessagesPageSchema = z.object({
  messages: z.array(groupChatMessageSchema),
  nextCursor: z.number().nullable(),
  hasNext: z.boolean()
})

export type ReplyMessage = z.infer<typeof replyMessageSchema>
export type NewsShare = z.infer<typeof newsShareSchema>
export type GroupChatMessage = z.infer<typeof groupChatMessageSchema>
export type GroupChatMessagesPage = z.infer<typeof groupChatMessagesPageSchema>

const apiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    status: z.number(),
    code: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    data: schema
  })

export async function fetchGroupChatMessages(
  beforeMessageId?: number | null
): Promise<GroupChatMessagesPage> {
  const response = await baseApi.get('/chat/group/messages', {
    params: {
      size: PAGE_SIZE,
      ...(beforeMessageId != null ? { beforeMessageId } : {})
    }
  })

  const parsed = apiResponseSchema(groupChatMessagesPageSchema).safeParse(response.data)

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
