import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ApiError } from '@/shared/api/base-api'

import {
  initialResetPasswordFormData,
  type ResetPasswordFieldErrors,
  type ResetPasswordFieldName,
  type ResetPasswordFormData,
  validateResetPasswordField,
  validateResetPasswordForm
} from './reset-password.schema'
import {
  useConfirmEmailVerificationMutation,
  useSendEmailVerificationMutation
} from './use-email-verification-mutation'
import { useResetPasswordMutation } from './use-reset-password-mutation'

type UseResetPasswordFormParams = {
  onSuccess: () => void
}

export function useResetPasswordForm({ onSuccess }: UseResetPasswordFormParams) {
  const [formData, setFormData] = useState<ResetPasswordFormData>(initialResetPasswordFormData)
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<ResetPasswordFieldName, boolean>>
  >({})
  const [verificationCode, setVerificationCode] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [codeCooldown, setCodeCooldown] = useState(0)
  const cooldownRef = useRef<number | null>(null)
  const resetGenerationRef = useRef(0)

  const { mutateAsync: sendEmailVerificationMutateAsync, isPending: isSendingCode } =
    useSendEmailVerificationMutation()
  const { mutateAsync: confirmEmailVerificationMutateAsync, isPending: isConfirmingCode } =
    useConfirmEmailVerificationMutation()
  const { mutateAsync: resetPasswordMutateAsync } = useResetPasswordMutation()

  const isVerifying = isSendingCode || isConfirmingCode
  const isCooldownActive = codeCooldown > 0

  useEffect(() => {
    if (!isCooldownActive) return

    cooldownRef.current = window.setInterval(() => {
      setCodeCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) {
            window.clearInterval(cooldownRef.current)
            cooldownRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (cooldownRef.current) {
        window.clearInterval(cooldownRef.current)
        cooldownRef.current = null
      }
    }
  }, [isCooldownActive])

  const getNormalizedFormData = (data: ResetPasswordFormData): ResetPasswordFormData => ({
    ...data,
    email: data.email.trim()
  })

  const resetForm = () => {
    resetGenerationRef.current += 1

    if (cooldownRef.current) {
      window.clearInterval(cooldownRef.current)
      cooldownRef.current = null
    }

    setFormData(initialResetPasswordFormData)
    setFieldErrors({})
    setTouchedFields({})
    setVerificationCode('')
    setIsCodeSent(false)
    setIsEmailVerified(false)
    setCodeCooldown(0)
    setLoading(false)
  }

  const handleChange = (field: ResetPasswordFieldName) => (e: ChangeEvent<HTMLInputElement>) => {
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
          const normalizedNextFormData =
            field === 'email'
              ? { ...nextFormData, email: value.trim() }
              : getNormalizedFormData(nextFormData)

          const fieldValue = field === 'email' ? value.trim() : value
          const message = validateResetPasswordField(field, fieldValue, normalizedNextFormData)

          if (message) nextErrors[field] = message
          else delete nextErrors[field]
        }

        if (field === 'newPassword' && touchedFields.confirmPassword) {
          const normalizedNextFormData = getNormalizedFormData(nextFormData)
          const confirmMessage = validateResetPasswordField(
            'confirmPassword',
            nextFormData.confirmPassword,
            normalizedNextFormData
          )

          if (confirmMessage) nextErrors.confirmPassword = confirmMessage
          else delete nextErrors.confirmPassword
        }

        return nextErrors
      })

      return nextFormData
    })
  }

  const handleBlur = (field: ResetPasswordFieldName) => () => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true
    }))

    const normalizedFormData = getNormalizedFormData(formData)
    const fieldValue = field === 'email' ? formData.email.trim() : formData[field]
    const message = validateResetPasswordField(field, fieldValue, normalizedFormData)

    setFieldErrors((prev) => {
      const next = { ...prev }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const handleVerificationCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value)
  }

  const handleSendVerificationCode = async () => {
    const normalizedFormData = getNormalizedFormData(formData)
    const trimmedEmail = normalizedFormData.email
    const emailError = validateResetPasswordField('email', trimmedEmail, normalizedFormData)

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

    const generation = resetGenerationRef.current

    try {
      await sendEmailVerificationMutateAsync({
        email: trimmedEmail,
        purpose: 'PASSWORD_RESET'
      })

      if (generation !== resetGenerationRef.current) return

      setIsEmailVerified(false)
      setIsCodeSent(true)
      setVerificationCode('')

      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.email
        return next
      })

      toast.success('인증코드를 이메일로 전송했어요')
      setCodeCooldown(30)
    } catch (error) {
      if (generation !== resetGenerationRef.current) return

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
          case 'USER_NOT_FOUND':
            toast.error('가입된 이메일을 찾을 수 없습니다.')
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
    const normalizedFormData = getNormalizedFormData(formData)
    const trimmedEmail = normalizedFormData.email
    const trimmedCode = verificationCode.trim()
    const emailError = validateResetPasswordField('email', trimmedEmail, normalizedFormData)

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

    const generation = resetGenerationRef.current

    try {
      await confirmEmailVerificationMutateAsync({
        email: trimmedEmail,
        code: trimmedCode,
        purpose: 'PASSWORD_RESET'
      })

      if (generation !== resetGenerationRef.current) return

      setIsEmailVerified(true)

      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.email
        return next
      })

      toast.success('이메일 인증이 완료되었어요')
    } catch (error) {
      if (generation !== resetGenerationRef.current) return
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

    setTouchedFields({
      email: true,
      newPassword: true,
      confirmPassword: true
    })

    const normalizedFormData = getNormalizedFormData(formData)
    const nextErrors = validateResetPasswordForm(normalizedFormData, isEmailVerified)
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)

    const generation = resetGenerationRef.current

    try {
      await resetPasswordMutateAsync({
        email: normalizedFormData.email,
        newPassword: normalizedFormData.newPassword
      })

      if (generation !== resetGenerationRef.current) return

      toast.success('비밀번호가 재설정되었어요.')
      resetForm()
      onSuccess()
    } catch (error) {
      if (generation !== resetGenerationRef.current) return

      if (error instanceof ApiError) {
        if (
          error.code === 'AUTH_VALIDATION_FAILED' &&
          error.data &&
          typeof error.data === 'object'
        ) {
          const serverErrors = error.data as Record<string, string>
          const mappedErrors: ResetPasswordFieldErrors = {}

          Object.entries(serverErrors).forEach(([key, message]) => {
            if (Object.prototype.hasOwnProperty.call(initialResetPasswordFormData, key)) {
              mappedErrors[key as ResetPasswordFieldName] = message
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
          case 'AUTH_VERIFICATION_CODE_EXPIRED':
            toast.error('이메일 인증이 만료되었습니다. 다시 인증해주세요.')
            return
          case 'AUTH_PASSWORD_SAME_AS_OLD':
            toast.error('새 비밀번호는 기존 비밀번호와 달라야 합니다.')
            return
          case 'USER_NOT_FOUND':
            toast.error('가입된 이메일을 찾을 수 없습니다.')
            return
          default:
            toast.error('비밀번호 재설정 중 문제가 발생했습니다. 다시 시도해주세요.')
            return
        }
      }

      toast.error('서버와 통신 중 오류가 발생했습니다.')
    } finally {
      if (generation === resetGenerationRef.current) {
        setLoading(false)
      }
    }
  }

  const inputClassName = (field: ResetPasswordFieldName) =>
    `h-12 w-full rounded-xl border px-3 text-sm outline-none transition-colors ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500'
        : 'border-wefin-line focus:border-wefin-mint'
    }`

  const verificationCodeInputClassName =
    'h-12 w-full rounded-xl border border-wefin-line px-3 text-sm outline-none transition-colors focus:border-wefin-mint'

  return {
    formData,
    fieldErrors,
    verificationCode,
    isCodeSent,
    isEmailVerified,
    codeCooldown,
    loading,
    isVerifying,
    handleChange,
    handleBlur,
    handleVerificationCodeChange,
    handleSendVerificationCode,
    handleConfirmVerificationCode,
    handleSubmit,
    inputClassName,
    verificationCodeInputClassName,
    resetForm
  }
}
