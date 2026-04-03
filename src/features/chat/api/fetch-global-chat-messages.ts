import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

const isDev = import.meta.env.DEV

export const globalChatMessageSchema = z.object({
  messageId: z.number().nullable(),
  userId: z.string().nullable(), // 추후 UUID 검증으로 변경 예정
  role: z.enum(['USER', 'SYSTEM']),
  sender: z.string().nullable().optional(),
  content: z.string(),
  createdAt: z.string()
})

export type GlobalChatMessage = z.infer<typeof globalChatMessageSchema>

const apiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    status: z.number(),
    code: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    data: schema
  })

export async function fetchGlobalChatMessages(): Promise<GlobalChatMessage[]> {
  const response = await baseApi.get('/chat/global/messages')

  const parsed = apiResponseSchema(z.array(globalChatMessageSchema)).safeParse(response.data)

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
