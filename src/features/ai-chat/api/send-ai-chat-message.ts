import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

const isDev = import.meta.env.DEV

const aiChatParsedSectionSchema = z.object({
  title: z.string(),
  items: z.array(z.string())
})

const aiChatMessageSchema = z.object({
  messageId: z.number().nullable().optional(),
  userId: z.string().nullable(),
  role: z.enum(['USER', 'AI']),
  content: z.string(),
  createdAt: z.string(),
  parsedSections: z.array(aiChatParsedSectionSchema).optional().default([])
})

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>

interface SendAiChatMessageOptions {
  newsClusterId?: number
}

const apiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    status: z.number(),
    code: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    data: schema
  })

export async function sendAiChatMessage(
  message: string,
  options?: SendAiChatMessageOptions
): Promise<AiChatMessage> {
  // 메시지 전송은 로그인된 사용자의 Authorization 헤더와 함께 백엔드 /chat/ai/messages POST로 전달된다.
  const response = await baseApi.post(
    '/chat/ai/messages',
    {
      message,
      newsClusterId: options?.newsClusterId
    },
    {
      // AI 응답 생성은 일반 REST 요청보다 오래 걸릴 수 있어서 전용 timeout을 더 길게 준다.
      timeout: 60000
    }
  )

  const parsed = apiResponseSchema(aiChatMessageSchema).safeParse(response.data)

  if (!parsed.success) {
    if (isDev) {
      console.error('AI 채팅 전송 응답 파싱 실패:', parsed.error.flatten())
    } else {
      console.error('AI 채팅 전송 응답 파싱 실패')
    }
    throw parsed.error
  }

  return parsed.data.data
}
