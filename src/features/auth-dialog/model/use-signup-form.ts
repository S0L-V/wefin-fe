import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ApiError, baseApi } from '@/shared/api/base-api'

import {
  initialSignupFormData,
  type SignupFieldErrors,
  type SignupFieldName,
  type SignupFormData,
  validateSignupField,
  validateSignupForm
} from './signup.schema'
import {
  useConfirmEmailVerificationMutation,
  useSendEmailVerificationMutation
} from './use-email-verification-mutation'
import { useSignupMutation } from './use-signup-mutation'

type UseSignupFormParams = {
  onSuccess: () => void
}

export function useSignupForm({ onSuccess }: UseSignupFormParams) {
  const [formData, setFormData] = useState<SignupFormData>(initialSignupFormData)
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<Partial<Record<SignupFieldName, boolean>>>({})
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeCooldown, setCodeCooldown] = useState(0)
  const cooldownRef = useRef<number | null>(null)

  const isCooldownActive = codeCooldown > 0
  useEffect(() => {
    if (!isCooldownActive) return
    cooldownRef.current = window.setInterval(() => {
      setCodeCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) window.clearInterval(cooldownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (cooldownRef.current) window.clearInterval(cooldownRef.current)
    }
  }, [isCooldownActive])

  const { mutateAsync: signupMutateAsync } = useSignupMutation()
  const { mutateAsync: sendEmailVerificationMutateAsync, isPending: isSendingCode } =
    useSendEmailVerificationMutation()
  const { mutateAsync: confirmEmailVerificationMutateAsync, isPending: isConfirmingCode } =
    useConfirmEmailVerificationMutation()

  const isVerifying = isSendingCode || isConfirmingCode

  const handleChange = (field: SignupFieldName) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [field]: value
      }

      if (field === 'email') {
        setIsEmailVerified(false)
        setIsCodeSent(false)
        setVerificationCode('')
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

  const handleVerificationCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setVerificationCode(value)
  }

  const handleSendVerificationCode = async () => {
    const trimmedEmail = formData.email.trim()
    const emailError = validateSignupField('email', trimmedEmail, formData)

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

    try {
      await sendEmailVerificationMutateAsync({
        email: trimmedEmail,
        purpose: 'SIGNUP'
      })

      setIsEmailVerified(false)
      setIsCodeSent(true)
      setVerificationCode('')

      setFieldErrors((prev) => {
        const next = { ...prev }
        if (next.email === '이메일 인증이 필요합니다.') {
          delete next.email
        }
        return next
      })

      toast.success('인증코드를 이메일로 전송했어요')
      setCodeCooldown(30)
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.code) {
          case 'AUTH_VERIFICATION_TOO_FAST_REQUEST':
            toast.error('요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.')
            return

          case 'AUTH_VERIFICATION_TOO_MANY_ATTEMPTS':
            toast.error('인증 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.')
            return

          case 'AUTH_VERIFICATION_TOO_MANY_REQUESTS':
            toast.error('인증코드 요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.')
            return

          case 'AUTH_EMAIL_DUPLICATED':
            toast.error('이미 사용 중인 이메일입니다.')
            return

          default:
            toast.error('인증코드 전송 중 문제가 발생했습니다. 다시 시도해주세요.')
            return
        }
      }

      toast.error('서버와 통신 중 오류가 발생했습니다.')
    }
  }

  const handleConfirmVerificationCode = async () => {
    const trimmedEmail = formData.email.trim()
    const trimmedCode = verificationCode.trim()
    const emailError = validateSignupField('email', trimmedEmail, formData)

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

    if (!trimmedCode) {
      toast.error('인증코드를 입력해주세요.')
      return
    }

    try {
      await confirmEmailVerificationMutateAsync({
        email: trimmedEmail,
        code: trimmedCode,
        purpose: 'SIGNUP'
      })

      setIsEmailVerified(true)

      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.email
        return next
      })

      toast.success('이메일 인증이 완료되었어요')
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.code) {
          case 'AUTH_VERIFICATION_CODE_INVALID':
            toast.error('인증코드가 올바르지 않습니다.')
            return

          case 'AUTH_VERIFICATION_CODE_EXPIRED':
            toast.error('인증코드가 만료되었습니다. 다시 요청해주세요.')
            return

          case 'AUTH_VERIFICATION_TOO_MANY_ATTEMPTS':
            toast.error('인증 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.')
            return

          case 'AUTH_EMAIL_NOT_VERIFIED':
            toast.error('이메일 인증을 완료해주세요.')
            return

          default:
            toast.error('이메일 인증 중 문제가 발생했습니다. 다시 시도해주세요.')
            return
        }
      }

      toast.error('서버와 통신 중 오류가 발생했습니다.')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast.error('')

    setTouchedFields({
      nickname: true,
      email: true,
      password: true,
      confirmPassword: true
    })

    const nextErrors = validateSignupForm(formData, isEmailVerified)
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)

    try {
      await signupMutateAsync({
        email: formData.email.trim(),
        nickname: formData.nickname.trim(),
        password: formData.password
      })

      setFormData(initialSignupFormData)
      setFieldErrors({})
      setTouchedFields({})
      setIsEmailVerified(false)
      setIsCodeSent(false)
      setVerificationCode('')
      toast.error('')

      onSuccess()
    } catch (error) {
      if (error instanceof ApiError) {
        if (
          error.code === 'AUTH_VALIDATION_FAILED' &&
          error.data &&
          typeof error.data === 'object'
        ) {
          const serverErrors = error.data as Record<string, string>
          const mappedErrors: SignupFieldErrors = {}

          Object.entries(serverErrors).forEach(([key, message]) => {
            if (Object.prototype.hasOwnProperty.call(initialSignupFormData, key)) {
              mappedErrors[key as SignupFieldName] = message
            }
          })

          setFieldErrors((prev) => ({
            ...prev,
            ...mappedErrors
          }))

          const firstError = Object.values(serverErrors)[0]
          toast.error(firstError || '입력값을 확인해주세요.')
          return
        }

        if (
          error.code === 'AUTH_EMAIL_NOT_VERIFIED' ||
          error.code === 'AUTH_VERIFICATION_CODE_EXPIRED'
        ) {
          setIsEmailVerified(false)
        }

        switch (error.code) {
          case 'AUTH_EMAIL_NOT_VERIFIED':
            toast.error('이메일 인증을 완료해주세요.')
            return

          case 'AUTH_EMAIL_DUPLICATED':
            toast.error('이미 사용 중인 이메일입니다.')
            return

          case 'AUTH_NICKNAME_DUPLICATED':
            toast.error('이미 사용 중인 닉네임입니다.')
            return

          case 'AUTH_VERIFICATION_CODE_EXPIRED':
            toast.error('이메일 인증이 만료되었습니다. 다시 인증해주세요.')
            return

          default:
            toast.error('회원가입 중 문제가 발생했습니다. 다시 시도해주세요.')
            return
        }
      }

      toast.error('서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'kakao') => {
    try {
      const response = await baseApi.get(`/auth/${provider}/url`)
      const url = response.data?.url

      if (!url) {
        throw new Error('OAuth 로그인 URL이 응답에 포함되어 있지 않습니다.')
      }

      const popup = window.open(url, 'oauth_popup', 'width=600,height=700')

      if (!popup) {
        toast.error('팝업이 차단되었습니다. 브라우저 팝업 차단을 해제해주세요.')
        return
      }
    } catch {
      toast.error(`${provider} 로그인 URL을 가져오는 데 실패했습니다.`)
    }
  }

  const inputClassName = (field: SignupFieldName) =>
    `h-12 w-full rounded-xl border px-3 text-sm outline-none transition-colors ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500'
        : 'border-slate-200 focus:border-[#56c1c9]'
    }`

  const verificationCodeInputClassName =
    'h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-[#56c1c9]'

  return {
    formData,
    fieldErrors,
    isEmailVerified,
    isCodeSent,
    verificationCode,
    codeCooldown,
    loading,
    isVerifying,
    handleChange,
    handleBlur,
    handleVerificationCodeChange,
    handleSendVerificationCode,
    handleConfirmVerificationCode,
    handleSubmit,
    handleOAuth,
    inputClassName,
    verificationCodeInputClassName
  }
}
