import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import {
  type ChangePasswordFieldErrors,
  type ChangePasswordFieldName,
  initialChangePasswordFormData,
  validateChangePasswordField,
  validateChangePasswordForm
} from '@/features/auth-dialog/model/change-password.schema'
import { useChangePasswordMutation } from '@/features/auth-dialog/model/use-change-password-mutation'
import { ApiError } from '@/shared/api/base-api'

type ChangePasswordDialogProps = {
  open: boolean
  onClose: () => void
}

function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const [formData, setFormData] = useState(initialChangePasswordFormData)
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<ChangePasswordFieldName, boolean>>
  >({})

  const { mutateAsync: changePasswordMutateAsync, isPending } = useChangePasswordMutation()

  const resetForm = () => {
    setFormData(initialChangePasswordFormData)
    setFieldErrors({})
    setTouchedFields({})
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
      onClose()
    }
  }

  const handleChange = (field: ChangePasswordFieldName) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [field]: value
      }

      setFieldErrors((prevErrors) => {
        const nextErrors = { ...prevErrors }

        if (touchedFields[field]) {
          const message = validateChangePasswordField(field, value, nextFormData)
          if (message) nextErrors[field] = message
          else delete nextErrors[field]
        }

        if (field === 'newPassword' && touchedFields.confirmPassword) {
          const confirmMessage = validateChangePasswordField(
            'confirmPassword',
            nextFormData.confirmPassword,
            nextFormData
          )

          if (confirmMessage) nextErrors.confirmPassword = confirmMessage
          else delete nextErrors.confirmPassword
        }

        if (field === 'currentPassword' && touchedFields.newPassword) {
          const newPasswordMessage = validateChangePasswordField(
            'newPassword',
            nextFormData.newPassword,
            nextFormData
          )

          if (newPasswordMessage) nextErrors.newPassword = newPasswordMessage
          else delete nextErrors.newPassword
        }

        return nextErrors
      })

      return nextFormData
    })
  }

  const handleBlur = (field: ChangePasswordFieldName) => () => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true
    }))

    const message = validateChangePasswordField(field, formData[field], formData)

    setFieldErrors((prev) => {
      const next = { ...prev }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const inputClassName = (field: ChangePasswordFieldName) =>
    `h-12 w-full rounded-xl border px-3 text-sm outline-none transition-colors ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500'
        : 'border-slate-200 focus:border-[#56c1c9]'
    }`

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setTouchedFields({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    })

    const nextErrors = validateChangePasswordForm(formData)
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    try {
      await changePasswordMutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      toast.success('비밀번호가 변경되었어요.')
      resetForm()
      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        if (
          error.code === 'AUTH_VALIDATION_FAILED' &&
          error.data &&
          typeof error.data === 'object'
        ) {
          const serverErrors = error.data as Record<string, string>
          const mappedErrors: ChangePasswordFieldErrors = {}

          Object.entries(serverErrors).forEach(([key, message]) => {
            if (Object.prototype.hasOwnProperty.call(initialChangePasswordFormData, key)) {
              mappedErrors[key as ChangePasswordFieldName] = message
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

        switch (error.code) {
          case 'AUTH_PASSWORD_MISMATCH':
            toast.error('현재 비밀번호가 일치하지 않습니다.')
            return
          case 'AUTH_PASSWORD_SAME_AS_OLD':
            toast.error('새 비밀번호는 기존 비밀번호와 달라야 합니다.')
            return
          case 'AUTH_UNAUTHORIZED':
            toast.error('로그인이 필요합니다.')
            return
          default:
            toast.error('비밀번호 변경 중 문제가 발생했습니다. 다시 시도해주세요.')
            return
        }
      }

      toast.error('서버와 통신 중 오류가 발생했습니다.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Dialog.Title className="text-xl font-semibold text-slate-900">
                비밀번호 변경
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">
                현재 비밀번호를 확인한 뒤 새 비밀번호로 변경하세요.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100"
                aria-label="닫기"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="change-password-current" className="sr-only">
                현재 비밀번호
              </label>
              <input
                id="change-password-current"
                type="password"
                placeholder="현재 비밀번호"
                required
                value={formData.currentPassword}
                onChange={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
                className={inputClassName('currentPassword')}
              />
              {fieldErrors.currentPassword ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.currentPassword}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="change-password-new" className="sr-only">
                새 비밀번호
              </label>
              <input
                id="change-password-new"
                type="password"
                placeholder="새 비밀번호"
                required
                value={formData.newPassword}
                onChange={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                className={inputClassName('newPassword')}
              />
              {fieldErrors.newPassword ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.newPassword}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="change-password-confirm" className="sr-only">
                새 비밀번호 확인
              </label>
              <input
                id="change-password-confirm"
                type="password"
                placeholder="새 비밀번호 확인"
                required
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                className={inputClassName('confirmPassword')}
              />
              {fieldErrors.confirmPassword ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-xl bg-[#56c1c9] text-sm font-semibold text-white transition-colors hover:bg-[#48b4bc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ChangePasswordDialog
