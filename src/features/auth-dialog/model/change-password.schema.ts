export type ChangePasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type ChangePasswordFieldName = keyof ChangePasswordFormData

export type ChangePasswordFieldErrors = Partial<Record<ChangePasswordFieldName, string>>

export const initialChangePasswordFormData: ChangePasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/

export function validateChangePasswordField(
  field: ChangePasswordFieldName,
  value: string,
  formData: ChangePasswordFormData
): string | undefined {
  switch (field) {
    case 'currentPassword':
      if (!value) return '현재 비밀번호를 입력해주세요.'
      return undefined

    case 'newPassword':
      if (!value) return '새 비밀번호를 입력해주세요.'
      if (value.length < 8 || value.length > 20) {
        return '비밀번호는 8자 이상 20자 이하로 입력해주세요.'
      }
      if (!PASSWORD_REGEX.test(value)) {
        return '비밀번호는 영문과 숫자를 포함해야 합니다.'
      }
      if (value === formData.currentPassword) {
        return '기존 비밀번호와 달라야 합니다.'
      }
      return undefined

    case 'confirmPassword':
      if (!value) return '비밀번호 확인을 입력해주세요.'
      if (value !== formData.newPassword) {
        return '비밀번호가 일치하지 않습니다.'
      }
      return undefined

    default:
      return undefined
  }
}

export function validateChangePasswordForm(
  formData: ChangePasswordFormData
): ChangePasswordFieldErrors {
  const errors: ChangePasswordFieldErrors = {}

  ;(Object.keys(formData) as ChangePasswordFieldName[]).forEach((field) => {
    const message = validateChangePasswordField(field, formData[field], formData)
    if (message) errors[field] = message
  })

  return errors
}
