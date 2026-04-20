import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const withdrawRequestSchema = z.object({
  password: z.string().min(1)
})

const voidDataSchema = z.null()

export type WithdrawRequest = z.infer<typeof withdrawRequestSchema>

export async function withdraw(request: WithdrawRequest): Promise<void> {
  const validatedRequest = withdrawRequestSchema.parse(request)
  const response = await baseApi.delete('/auth/me', {
    data: validatedRequest
  })
  apiResponseSchema(voidDataSchema).parse(response.data)
}
