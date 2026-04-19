export type ResetPasswordFormData = {
  email: string
  newPassword: string
  confirmPassword: string
}

export type ResetPasswordFieldName = keyof ResetPasswordFormData

export type ResetPasswordFieldErrors = Partial<Record<ResetPasswordFieldName, string>>

export const initialResetPasswordFormData: ResetPasswordFormData = {
  email: '',
  newPassword: '',
  confirmPassword: ''
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/

export function validateResetPasswordField(
  field: ResetPasswordFieldName,
  value: string,
  formData: ResetPasswordFormData
): string | undefined {
  const trimmedValue = value.trim()

  switch (field) {
    case 'email':
      if (!trimmedValue) return '이메일을 입력해주세요.'
      if (!EMAIL_REGEX.test(trimmedValue)) return '올바른 이메일 형식이 아닙니다.'
      return undefined

    case 'newPassword':
      if (!value) return '새 비밀번호를 입력해주세요.'
      if (value.trim() !== value) return '비밀번호 앞뒤 공백은 허용되지 않습니다.'
      if (value.length < 8 || value.length > 20) {
        return '비밀번호는 8자 이상 20자 이하로 입력해주세요.'
      }
      if (!PASSWORD_REGEX.test(value)) {
        return '비밀번호는 영문과 숫자를 모두 포함해야 합니다.'
      }
      return undefined

    case 'confirmPassword':
      if (!value) return '비밀번호 확인을 입력해주세요.'
      if (value !== formData.newPassword) return '비밀번호가 일치하지 않습니다.'
      return undefined

    default:
      return undefined
  }
}

export function validateResetPasswordForm(
  formData: ResetPasswordFormData,
  isEmailVerified: boolean
): ResetPasswordFieldErrors {
  const nextErrors: ResetPasswordFieldErrors = {}

  ;(Object.keys(formData) as ResetPasswordFieldName[]).forEach((field) => {
    const message = validateResetPasswordField(field, formData[field], formData)
    if (message) nextErrors[field] = message
  })

  if (!isEmailVerified && !nextErrors.email) {
    nextErrors.email = '이메일 인증이 필요합니다.'
  }

  return nextErrors
}
