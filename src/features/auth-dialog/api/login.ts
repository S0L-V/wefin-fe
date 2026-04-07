import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const loginDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  userId: z.string(),
  nickname: z.string()
})

export type LoginRequest = {
  email: string
  password: string
}

export type LoginData = z.infer<typeof loginDataSchema>

export async function login(request: LoginRequest): Promise<LoginData> {
  const response = await baseApi.post('/auth/login', request)
  const parsed = apiResponseSchema(loginDataSchema).parse(response.data)
  return parsed.data
}
