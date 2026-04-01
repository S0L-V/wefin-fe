import axios from 'axios'
import { useState } from 'react'

import {
  initialSignupFormData,
  type SignupFieldErrors,
  type SignupFieldName,
  type SignupFormData,
  validateSignupField,
  validateSignupForm
} from './signup.schema'
import { useSignupMutation } from './use-signup-mutation'

/*
 외부에서 성공 시 실행할 콜백 전달받음 
 */
type UseSignupFormParams = {
  onSuccess: () => void
}

export function useSignupForm({ onSuccess }: UseSignupFormParams) {
  /*
   상태 관리 (UI 상태)
   */

  // 입력값 상태
  const [formData, setFormData] = useState<SignupFormData>(initialSignupFormData)

  // 필드별 에러 메시지
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({})

  // 사용자가 입력을 건드렸는지 여부
  const [touchedFields, setTouchedFields] = useState<Partial<Record<SignupFieldName, boolean>>>({})

  // 이메일 인증 여부 (현재 mock)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  // 공통 에러 메시지
  const [error, setError] = useState('')

  // submit 로딩 상태
  const [loading, setLoading] = useState(false)

  // 이메일 인증 버튼 로딩 상태
  const [isVerifying, setIsVerifying] = useState(false)

  /*
   React Query mutation
   */
  const { mutateAsync } = useSignupMutation()

  /*
   입력값 변경 핸들러 
   */
  const handleChange = (field: SignupFieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [field]: value
      }

      // 이메일 변경 시 인증 초기화
      if (field === 'email') {
        setIsEmailVerified(false)
      }

      /*
         실시간 검증 (이미 터치된 필드만)
         */
      setFieldErrors((prevErrors) => {
        const nextErrors = { ...prevErrors }

        if (touchedFields[field]) {
          const message = validateSignupField(field, value, nextFormData)
          if (message) nextErrors[field] = message
          else delete nextErrors[field]
        }

        /*
           비밀번호 변경 시 confirmPassword도 재검증
           */
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

    // 공통 에러 초기화
    if (error) setError('')
  }

  /*
   blur 시 검증 
   */
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

  /*
   이메일 인증 (현재 mock)
   */
  const handleVerifyEmail = async () => {
    const emailError = validateSignupField('email', formData.email, formData)

    setTouchedFields((prev) => ({
      ...prev,
      email: true
    }))

    // 이메일 형식이 틀리면 인증 진행 안 함
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
      // TODO: 실제 API로 교체
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsEmailVerified(true)

      // 이메일 에러 제거
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

  /*
   submit 처리
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    /*
     모든 필드 touched 처리
     */
    setTouchedFields({
      nickname: true,
      email: true,
      password: true,
      confirmPassword: true,
      inviteCode: true
    })

    /*
     전체 검증
     */
    const nextErrors = validateSignupForm(formData, isEmailVerified)
    setFieldErrors(nextErrors)

    // 에러 있으면 submit 중단
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)

    try {
      /*
       React Query mutation 실행
       */
      await mutateAsync({
        email: formData.email.trim(),
        nickname: formData.nickname.trim(),
        password: formData.password
      })

      /*
       성공 처리
       */
      setFormData(initialSignupFormData)
      setFieldErrors({})
      setTouchedFields({})
      setIsEmailVerified(false)
      setError('')

      onSuccess()
    } catch (error) {
      /*
       axios 에러 처리
       */
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as
          | {
              code?: string
              message?: string
              data?: Record<string, string>
            }
          | undefined

        /*
         백엔드 validation 에러 처리
         */
        if (serverError?.code === 'AUTH_VALIDATION_FAILED' && serverError.data) {
          const mappedErrors: SignupFieldErrors = {}

          Object.entries(serverError.data).forEach(([key, message]) => {
            if (key in initialSignupFormData) {
              mappedErrors[key as SignupFieldName] = message
            }
          })

          setFieldErrors((prev) => ({
            ...prev,
            ...mappedErrors
          }))

          const firstError = Object.values(serverError.data)[0]
          setError(firstError || serverError.message || '입력값을 확인해주세요.')
        } else {
          setError(serverError?.message || '회원가입 중 오류가 발생했습니다.')
        }
      } else {
        setError('서버와 통신 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  /*
   TODO: OAuth 로그인
   */
  const handleOAuth = async (provider: 'google' | 'kakao') => {
    try {
      const response = await fetch(`/api/auth/${provider}/url`)
      const result = await response.json()
      const url = result?.url

      if (!url) throw new Error()

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

  /*
   외부 반환
   */
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
