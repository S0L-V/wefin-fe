import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1)
})

const voidDataSchema = z.null()

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  const validatedRequest = changePasswordRequestSchema.parse(request)
  const response = await baseApi.post('/auth/password/change', validatedRequest)
  apiResponseSchema(voidDataSchema).parse(response.data)
}
