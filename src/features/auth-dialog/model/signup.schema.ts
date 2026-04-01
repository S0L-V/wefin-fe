export type SignupFormData = {
  nickname: string
  email: string
  password: string
  confirmPassword: string
  inviteCode: string
}

export type SignupFieldName = keyof SignupFormData
export type SignupFieldErrors = Partial<Record<SignupFieldName, string>>

export interface SignupResponseData {
  userId: string
  email: string
  nickname: string
}

export interface ApiResponse<T> {
  status: number
  code: string
  message: string
  data: T | null
}

export const initialSignupFormData: SignupFormData = {
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  inviteCode: ''
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateSignupField(
  field: SignupFieldName,
  value: string,
  currentFormData: SignupFormData
) {
  switch (field) {
    case 'nickname':
      if (!value.trim()) return '닉네임을 입력해주세요.'
      if (value.trim().length < 2) return '닉네임은 2자 이상 입력해주세요.'
      if (value.trim().length > 20) return '닉네임은 20자 이하로 입력해주세요.'
      return ''

    case 'email':
      if (!value.trim()) return '이메일을 입력해주세요.'
      if (!emailRegex.test(value.trim())) return '올바른 이메일 형식을 입력해주세요.'
      return ''

    case 'password':
      if (!value) return '비밀번호를 입력해주세요.'
      if (value.length < 8) return '비밀번호는 8자 이상 입력해주세요.'
      return ''

    case 'confirmPassword':
      if (!value) return '비밀번호 확인을 입력해주세요.'
      if (value !== currentFormData.password) return '비밀번호가 일치하지 않습니다.'
      return ''

    case 'inviteCode':
      return ''

    default:
      return ''
  }
}

export function validateSignupForm(currentFormData: SignupFormData, isEmailVerified: boolean) {
  const nextErrors: SignupFieldErrors = {}

  ;(Object.keys(currentFormData) as SignupFieldName[]).forEach((field) => {
    const message = validateSignupField(field, currentFormData[field], currentFormData)
    if (message) {
      nextErrors[field] = message
    }
  })

  if (!isEmailVerified) {
    nextErrors.email = nextErrors.email || '이메일 인증이 필요합니다.'
  }

  return nextErrors
}
