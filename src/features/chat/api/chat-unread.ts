import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const isDev = import.meta.env.DEV

export const chatUnreadSchema = z.object({
  globalUnreadCount: z.number(),
  groupUnreadCount: z.number(),
  totalUnreadCount: z.number(),
  hasGlobalUnread: z.boolean(),
  hasGroupUnread: z.boolean(),
  lastReadGlobalMessageId: z.number().nullable(),
  lastReadGroupMessageId: z.number().nullable()
})

export const chatUnreadNotificationSchema = z.object({
  chatType: z.enum(['GLOBAL', 'GROUP']),
  messageId: z.number(),
  groupId: z.number().nullable(),
  sender: z.string(),
  content: z.string(),
  globalUnreadCount: z.number(),
  groupUnreadCount: z.number(),
  totalUnreadCount: z.number(),
  hasGlobalUnread: z.boolean(),
  hasGroupUnread: z.boolean(),
  lastReadGlobalMessageId: z.number().nullable(),
  lastReadGroupMessageId: z.number().nullable()
})

export type ChatUnread = z.infer<typeof chatUnreadSchema>
export type ChatUnreadNotification = z.infer<typeof chatUnreadNotificationSchema>

export async function fetchChatUnread(): Promise<ChatUnread> {
  const response = await baseApi.get('/chat/unread')
  const parsed = apiResponseSchema(chatUnreadSchema).safeParse(response.data)

  if (!parsed.success) {
    if (isDev) {
      console.error('채팅 unread 응답 파싱 실패:', parsed.error.flatten())
    } else {
      console.error('채팅 unread 응답 파싱 실패')
    }
    throw parsed.error
  }

  return parsed.data.data
}

export async function markGlobalChatRead(): Promise<void> {
  await baseApi.post('/chat/global/read')
}

export async function markGroupChatRead(): Promise<void> {
  await baseApi.post('/chat/group/read')
}
