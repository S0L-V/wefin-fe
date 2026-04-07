import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
})

export const loginResponseSchema = apiResponseSchema(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    userId: z.string(),
    nickname: z.string()
  })
)

export type LoginRequest = z.infer<typeof loginRequestSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>

export async function login(request: LoginRequest) {
  const validatedRequest = loginRequestSchema.parse(request)
  const response = await baseApi.post('/auth/login', validatedRequest)
  return loginResponseSchema.parse(response.data)
}
