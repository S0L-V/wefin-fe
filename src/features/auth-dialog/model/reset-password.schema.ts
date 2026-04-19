import { z } from 'zod'

export const resetPasswordSchema = z
  .object({
    email: z.email('올바른 이메일 형식이 아닙니다.'),
    code: z.string().min(1, '인증코드를 입력해주세요.'),
    newPassword: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .max(20, '비밀번호는 20자 이하여야 합니다.')
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, '비밀번호는 영문과 숫자를 포함해야 합니다.'),
    newPasswordConfirm: z.string().min(1, '새 비밀번호 확인을 입력해주세요.')
  })
  .refine((value) => value.newPassword === value.newPasswordConfirm, {
    path: ['newPasswordConfirm'],
    message: '새 비밀번호 확인이 일치하지 않습니다.'
  })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
