import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const signupRequestSchema = z.object({
  email: z.string().trim().email(),
  nickname: z.string().trim().min(2).max(20),
  password: z.string().min(8)
})

const signupDataSchema = z.object({
  userId: z.string(),
  email: z.string(),
  nickname: z.string()
})

export type SignupRequest = z.infer<typeof signupRequestSchema>
export type SignupData = z.infer<typeof signupDataSchema>

export async function signup(request: SignupRequest): Promise<SignupData> {
  const validatedRequest = signupRequestSchema.parse(request)
  const response = await baseApi.post('/auth/signup', validatedRequest)
  const parsed = apiResponseSchema(signupDataSchema).parse(response.data)
  return parsed.data
}
