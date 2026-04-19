import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const resetPasswordRequestSchema = z.object({
  email: z.string().trim().email(),
  newPassword: z.string().min(1)
})

const voidDataSchema = z.null()

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>

export async function resetPassword(request: ResetPasswordRequest): Promise<void> {
  const validatedRequest = resetPasswordRequestSchema.parse(request)
  const response = await baseApi.post('/auth/password/reset', validatedRequest)
  apiResponseSchema(voidDataSchema).parse(response.data)
}
