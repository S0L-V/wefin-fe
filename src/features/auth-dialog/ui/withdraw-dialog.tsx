import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { useWithdrawMutation } from '@/features/auth-dialog/model/use-withdraw-mutation'
import {
  initialWithdrawFormData,
  validateWithdrawField,
  validateWithdrawForm,
  type WithdrawFieldErrors,
  type WithdrawFieldName
} from '@/features/auth-dialog/model/withdraw.schema'
import { ApiError } from '@/shared/api/base-api'

type WithdrawDialogProps = {
  open: boolean
  onClose: () => void
}

function WithdrawDialog({ open, onClose }: WithdrawDialogProps) {
  const [formData, setFormData] = useState(initialWithdrawFormData)
  const [fieldErrors, setFieldErrors] = useState<WithdrawFieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<Partial<Record<WithdrawFieldName, boolean>>>(
    {}
  )

  const { mutateAsync: withdrawMutateAsync, isPending } = useWithdrawMutation()

  const resetForm = () => {
    setFormData(initialWithdrawFormData)
    setFieldErrors({})
    setTouchedFields({})
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
      onClose()
    }
  }

  const handleChange = (field: WithdrawFieldName) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const nextFormData = {
      ...formData,
      [field]: value
    }

    setFormData(nextFormData)

    setFieldErrors((prevErrors) => {
      const nextErrors = { ...prevErrors }

      if (touchedFields[field]) {
        const message = validateWithdrawField(field, value)
        if (message) nextErrors[field] = message
        else delete nextErrors[field]
      }

      return nextErrors
    })
  }

  const handleBlur = (field: WithdrawFieldName) => () => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true
    }))

    const message = validateWithdrawField(field, formData[field])

    setFieldErrors((prev) => {
      const next = { ...prev }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const inputClassName = (field: WithdrawFieldName) =>
    `h-12 w-full rounded-xl border px-3 text-sm outline-none transition-colors ${
      fieldErrors[field]
        ? 'border-red-400 focus:border-red-500'
        : 'border-slate-200 focus:border-red-400'
    }`

  const clearAuthState = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('nickname')
    localStorage.removeItem('email')
    window.dispatchEvent(new Event('auth-changed'))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setTouchedFields({
      password: true
    })

    const nextErrors = validateWithdrawForm(formData)
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    try {
      await withdrawMutateAsync({
        password: formData.password
      })

      clearAuthState()
      toast.success('회원 탈퇴가 완료되었어요.')
      resetForm()
      onClose()
      window.location.href = '/'
    } catch (error) {
      if (error instanceof ApiError) {
        if (
          error.code === 'AUTH_VALIDATION_FAILED' &&
          error.data &&
          typeof error.data === 'object'
        ) {
          const serverErrors = error.data as Record<string, string>
          const mappedErrors: WithdrawFieldErrors = {}

          Object.entries(serverErrors).forEach(([key, message]) => {
            if (Object.prototype.hasOwnProperty.call(initialWithdrawFormData, key)) {
              mappedErrors[key as WithdrawFieldName] = message
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
            toast.error('비밀번호가 일치하지 않습니다.')
            return
          case 'AUTH_UNAUTHORIZED':
            toast.error('로그인이 필요합니다.')
            return
          default:
            toast.error('회원 탈퇴 중 문제가 발생했습니다. 다시 시도해주세요.')
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
                회원 탈퇴
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">
                탈퇴 후 계정은 복구할 수 없습니다. 계속하려면 비밀번호를 입력해주세요.
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

          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-600">주의</p>
            <p className="mt-1 text-sm text-red-500">
              탈퇴하면 계정 정보 접근이 불가능하며, 진행 중인 서비스 이용 정보도 함께 정리될 수
              있습니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="withdraw-password" className="sr-only">
                비밀번호
              </label>
              <input
                id="withdraw-password"
                type="password"
                placeholder="비밀번호 입력"
                required
                autoComplete="current-password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'withdraw-password-error' : undefined}
                value={formData.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                className={inputClassName('password')}
              />
              {fieldErrors.password ? (
                <p id="withdraw-password-error" role="alert" className="mt-1 text-sm text-red-500">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-xl bg-red-500 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? '탈퇴 처리 중...' : '회원 탈퇴'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default WithdrawDialog
