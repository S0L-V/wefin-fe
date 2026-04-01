import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const signupRequestSchema = z.object({
  email: z.string().trim().email(),
  nickname: z.string().trim().min(2).max(20),
  password: z.string().min(8)
})

export const signupResponseSchema = apiResponseSchema(
  z.object({
    userId: z.string(),
    email: z.string(),
    nickname: z.string()
  })
)

export type SignupRequest = z.infer<typeof signupRequestSchema>
export type SignupResponse = z.infer<typeof signupResponseSchema>

export async function signup(request: SignupRequest) {
  const validatedRequest = signupRequestSchema.parse(request)
  const response = await baseApi.post('/auth/signup', validatedRequest)
  return signupResponseSchema.parse(response.data)
}
