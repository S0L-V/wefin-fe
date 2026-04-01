import { z } from 'zod'

import { baseApi } from '@/shared/api/base-api'

/**
 * Zod schema (응답 검증)
 */
export const signupResponseSchema = z.object({
  status: z.number(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
    email: z.string(),
    nickname: z.string()
  })
})

export type SignupResponse = z.infer<typeof signupResponseSchema>

/**
 * 요청 타입
 */
type SignupRequest = {
  email: string
  nickname: string
  password: string
}

/**
 * API 함수
 */
export async function signup(request: SignupRequest) {
  const response = await baseApi.post('/api/auth/signup', request)

  // 응답 검증
  return signupResponseSchema.parse(response.data)
}
