import { z } from 'zod'

import { apiResponseSchema } from '@/shared/api/api-response'
import { baseApi } from '@/shared/api/base-api'

export const issuedAccountTypeSchema = z.enum(['CONTEST', 'BUSINESS'])

export const issueAccountRequestSchema = z.object({
  accountType: issuedAccountTypeSchema,
  email: z.email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .max(20, '비밀번호는 20자 이하이어야 합니다.')
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, '비밀번호는 영문과 숫자를 포함해야 합니다.'),
  nickname: z.string().min(1, '닉네임은 필수입니다.').max(20, '닉네임은 20자 이하이어야 합니다.'),
  targetGroupId: z.number().int().min(1, '그룹 ID는 1 이상이어야 합니다.').nullable()
})

const issueAccountResponseSchema = apiResponseSchema(
  z.object({
    userId: z.uuid(),
    email: z.email(),
    nickname: z.string(),
    accountType: issuedAccountTypeSchema,
    activeGroupId: z.number().int().min(1),
    activeGroupName: z.string()
  })
)

export type IssueAccountRequest = z.infer<typeof issueAccountRequestSchema>
export type IssueAccountResponse = z.infer<typeof issueAccountResponseSchema>

export async function issueAccount(request: IssueAccountRequest): Promise<IssueAccountResponse> {
  const payload = {
    ...request,
    targetGroupId: request.targetGroupId ?? undefined
  }
  const response = await baseApi.post('/admin/accounts', payload)
  return issueAccountResponseSchema.parse(response.data)
}
