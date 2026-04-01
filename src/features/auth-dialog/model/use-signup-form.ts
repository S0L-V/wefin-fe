import { useState } from 'react'

import { signup } from '../api/signup'
import {
  initialSignupFormData,
  type SignupFieldErrors,
  type SignupFieldName,
  type SignupFormData,
  validateSignupField,
  validateSignupForm
} from './signup.schema'

type UseSignupFormParams = {
  onSuccess: () => void
}

export function useSignupForm({ onSuccess }: UseSignupFormParams) {
  const [formData, setFormData] = useState<SignupFormData>(initialSignupFormData)
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<Partial<Record<SignupFieldName, boolean>>>({})
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleChange = (field: SignupFieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [field]: value
      }

      if (field === 'email') {
        setIsEmailVerified(false)
      }

      setFieldErrors((prevErrors) => {
        const nextErrors = { ...prevErrors }

        if (touchedFields[field]) {
          const message = validateSignupField(field, value, nextFormData)
          if (message) nextErrors[field] = message
          else delete nextErrors[field]
        }

        if (field === 'password' && touchedFields.confirmPassword) {
          const confirmMessage = validateSignupField(
            'confirmPassword',
            nextFormData.confirmPassword,
            nextFormData
          )
          if (confirmMessage) nextErrors.confirmPassword = confirmMessage
          else delete nextErrors.confirmPassword
        }

        return nextErrors
      })

      return nextFormData
    })

    if (error) {
      setError('')
    }
  }

  const handleBlur = (field: SignupFieldName) => () => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true
    }))

    const message = validateSignupField(field, formData[field], formData)

    setFieldErrors((prev) => {
      const next = { ...prev }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const handleVerifyEmail = async () => {
    const emailError = validateSignupField('email', formData.email, formData)

    setTouchedFields((prev) => ({
      ...prev,
      email: true
    }))

    if (emailError) {
      setFieldErrors((prev) => ({
        ...prev,
        email: emailError
      }))
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsEmailVerified(true)
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.email
        return next
      })
      window.alert('이메일 인증이 완료되었습니다. (데모)')
    } catch {
      setError('이메일 인증 중 오류가 발생했습니다.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    setTouchedFields({
      nickname: true,
      email: true,
      password: true,
      confirmPassword: true,
      inviteCode: true
    })

    const nextErrors = validateSignupForm(formData, isEmailVerified)
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)

    try {
      const { response, result } = await signup({
        email: formData.email.trim(),
        nickname: formData.nickname.trim(),
        password: formData.password
      })

      if (response.ok) {
        setFormData(initialSignupFormData)
        setFieldErrors({})
        setTouchedFields({})
        setIsEmailVerified(false)
        setError('')
        onSuccess()
      } else if (result.code === 'AUTH_VALIDATION_FAILED' && result.data) {
        const serverErrors = result.data as Record<string, string>
        const mappedErrors: SignupFieldErrors = {}

        Object.entries(serverErrors).forEach(([key, message]) => {
          if (key in initialSignupFormData) {
            mappedErrors[key as SignupFieldName] = message
          }
        })

        setFieldErrors((prev) => ({
          ...prev,
          ...mappedErrors
        }))

        const firstError = Object.values(serverErrors)[0]
        setError(firstError || result.message || '입력값을 확인해주세요.')
      } else {
        setError(result.message || '회원가입 중 오류가 발생했습니다.')
      }
    } catch {
      setError('서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'kakao') => {
    try {
      const response = await fetch(`/api/auth/${provider}/url`)
      const result = await response.json()
      const url = result?.url

      if (!url) {
        throw new Error()
      }

      window.open(url, 'oauth_popup', 'width=600,height=700')
    } catch {
      setError(`${provider} 로그인 URL을 가져오는 데 실패했습니다.`)
    }
  }

  const inputClassName = (field: SignupFieldName) =>
    `h-12 w-full rounded-xl border px-3 text-sm outline-none transition-colors ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500'
        : 'border-slate-200 focus:border-[#56c1c9]'
    }`

  return {
    formData,
    fieldErrors,
    isEmailVerified,
    error,
    loading,
    isVerifying,
    handleChange,
    handleBlur,
    handleVerifyEmail,
    handleSubmit,
    handleOAuth,
    inputClassName
  }
}
