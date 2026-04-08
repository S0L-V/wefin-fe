import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

const isDev = import.meta.env.DEV
const PAGE_SIZE = 30

export const globalChatMessageSchema = z.object({
  messageId: z.number().nullable(),
  userId: z.string().nullable(),
  role: z.enum(['USER', 'SYSTEM']),
  sender: z.string().nullable().optional(),
  content: z.string(),
  createdAt: z.string()
})

const globalChatMessagesPageSchema = z.object({
  messages: z.array(globalChatMessageSchema),
  nextCursor: z.number().nullable(),
  hasNext: z.boolean()
})

export type GlobalChatMessage = z.infer<typeof globalChatMessageSchema>
export type GlobalChatMessagesPage = z.infer<typeof globalChatMessagesPageSchema>

const apiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    status: z.number(),
    code: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    data: schema
  })

export async function fetchGlobalChatMessages(
  beforeMessageId?: number | null
): Promise<GlobalChatMessagesPage> {
  const response = await baseApi.get('/chat/global/messages', {
    params: {
      size: PAGE_SIZE,
      ...(beforeMessageId != null ? { beforeMessageId } : {})
    }
  })

  const parsed = apiResponseSchema(globalChatMessagesPageSchema).safeParse(response.data)

  if (!parsed.success) {
    if (isDev) {
      console.error('전역 채팅 응답 파싱 실패:', parsed.error.flatten())
    } else {
      console.error('전역 채팅 응답 파싱 실패')
    }
    throw parsed.error
  }

  return parsed.data.data
}
