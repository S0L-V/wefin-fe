import { z } from 'zod'

// import { apiResponseSchema } from "@/shared/api/api-response";
import { baseApi } from '@/shared/api/base-api'

export const globalChatMessageSchema = z.object({
  messageId: z.number().nullable(),
  userId: z.string().nullable(), // string() -> uuid() 추후 변경
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

  console.log('raw chat response:', response.data)

  const parsed = apiResponseSchema(z.array(globalChatMessageSchema)).safeParse(response.data)

  if (!parsed.success) {
    console.error('chat parse error: ', parsed.error.flatten())
    throw parsed.error
  }

  return parsed.data.data
}
