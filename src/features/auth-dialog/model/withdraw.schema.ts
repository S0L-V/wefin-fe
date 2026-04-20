export type WithdrawFormData = {
  password: string
}

export type WithdrawFieldName = keyof WithdrawFormData

export type WithdrawFieldErrors = Partial<Record<WithdrawFieldName, string>>

export const initialWithdrawFormData: WithdrawFormData = {
  password: ''
}

export function validateWithdrawField(field: WithdrawFieldName, value: string): string | undefined {
  switch (field) {
    case 'password':
      if (!value) return '비밀번호를 입력해주세요.'
      return undefined
    default:
      return undefined
  }
}

export function validateWithdrawForm(formData: WithdrawFormData): WithdrawFieldErrors {
  const errors: WithdrawFieldErrors = {}

  ;(Object.keys(formData) as WithdrawFieldName[]).forEach((field) => {
    const message = validateWithdrawField(field, formData[field])
    if (message) errors[field] = message
  })

  return errors
}
