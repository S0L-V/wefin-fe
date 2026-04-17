import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

const verificationPurposeSchema = z.enum(['SIGNUP'])

const sendEmailVerificationRequestSchema = z.object({
  email: z.string().trim().email(),
  purpose: verificationPurposeSchema
})

const confirmEmailVerificationRequestSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().min(1, '인증코드를 입력해주세요.'),
  purpose: verificationPurposeSchema
})

const voidDataSchema = z.null()

export type SendEmailVerificationRequest = z.infer<typeof sendEmailVerificationRequestSchema>
export type ConfirmEmailVerificationRequest = z.infer<typeof confirmEmailVerificationRequestSchema>

export async function sendEmailVerification(request: SendEmailVerificationRequest): Promise<void> {
  const validatedRequest = sendEmailVerificationRequestSchema.parse(request)
  const response = await baseApi.post('/auth/email-verifications', validatedRequest)
  apiResponseSchema(voidDataSchema).parse(response.data)
}

export async function confirmEmailVerification(
  request: ConfirmEmailVerificationRequest
): Promise<void> {
  const validatedRequest = confirmEmailVerificationRequestSchema.parse(request)
  const response = await baseApi.post('/auth/email-verifications/confirm', validatedRequest)
  apiResponseSchema(voidDataSchema).parse(response.data)
}
