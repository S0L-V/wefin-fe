import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

const isDev = import.meta.env.DEV
const PAGE_SIZE = 30

const aiChatParsedSectionSchema = z.object({
  title: z.string(),
  items: z.array(z.string())
})

export const aiChatMessageSchema = z.object({
  messageId: z.number().nullable().optional(),
  userId: z.string().nullable(),
  role: z.enum(['USER', 'AI']),
  content: z.string(),
  createdAt: z.string(),
  parsedSections: z.array(aiChatParsedSectionSchema).optional().default([])
})

const aiChatMessagesPageSchema = z.object({
  messages: z.array(aiChatMessageSchema),
  nextCursor: z.number().nullable(),
  hasNext: z.boolean()
})

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>
export type AiChatMessagesPage = z.infer<typeof aiChatMessagesPageSchema>

const apiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    status: z.number(),
    code: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    data: schema
  })

export async function fetchAiChatMessages(): Promise<AiChatMessagesPage> {
  // AI 채팅 히스토리는 로그인 토큰이 자동으로 붙는 baseApi를 통해 백엔드 /chat/ai/messages 와 연결한다.
  const response = await baseApi.get('/chat/ai/messages', {
    params: {
      size: PAGE_SIZE
    }
  })

  const parsed = apiResponseSchema(aiChatMessagesPageSchema).safeParse(response.data)

  if (!parsed.success) {
    if (isDev) {
      console.error('AI 채팅 응답 파싱 실패:', parsed.error.flatten())
    } else {
      console.error('AI 채팅 응답 파싱 실패')
    }
    throw parsed.error
  }

  return parsed.data.data
}
