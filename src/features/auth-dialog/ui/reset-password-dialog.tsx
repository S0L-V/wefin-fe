import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { useResetPasswordForm } from '../model/use-reset-password-form'

type ResetPasswordDialogProps = {
  open: boolean
  onClose: () => void
}

function ResetPasswordDialog({ open, onClose }: ResetPasswordDialogProps) {
  const {
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
  } = useResetPasswordForm({
    onSuccess: onClose
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
      onClose()
      return
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
                비밀번호 재설정
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">
                이메일 인증 후 새 비밀번호를 설정하세요.
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
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="reset-password-email" className="sr-only">
                    이메일
                  </label>
                  <input
                    id="reset-password-email"
                    type="email"
                    placeholder="이메일"
                    required
                    value={formData.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    className={inputClassName('email')}
                    disabled={isEmailVerified}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isVerifying || isEmailVerified || codeCooldown > 0}
                  className="min-w-[88px] rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isVerifying
                    ? '전송 중...'
                    : isEmailVerified
                      ? '인증완료'
                      : codeCooldown > 0
                        ? `${codeCooldown}초`
                        : isCodeSent
                          ? '재전송'
                          : '인증코드'}
                </button>
              </div>

              {fieldErrors.email ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
              ) : null}
            </div>

            {isCodeSent ? (
              <div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label htmlFor="reset-password-verification-code" className="sr-only">
                      인증코드
                    </label>
                    <input
                      id="reset-password-verification-code"
                      type="text"
                      placeholder="인증코드 6자리"
                      value={verificationCode}
                      onChange={handleVerificationCodeChange}
                      className={verificationCodeInputClassName}
                      disabled={isEmailVerified}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmVerificationCode}
                    disabled={isVerifying || isEmailVerified}
                    className="rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isVerifying ? '확인 중...' : '코드확인'}
                  </button>
                </div>
              </div>
            ) : null}

            <div>
              <label htmlFor="reset-password-new-password" className="sr-only">
                새 비밀번호
              </label>
              <input
                id="reset-password-new-password"
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
              <label htmlFor="reset-password-confirm-password" className="sr-only">
                새 비밀번호 확인
              </label>
              <input
                id="reset-password-confirm-password"
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
              disabled={loading || !isEmailVerified}
              className="h-12 w-full rounded-xl bg-[#56c1c9] text-sm font-semibold text-white transition-colors hover:bg-[#48b4bc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '처리 중...' : '비밀번호 재설정'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export { ResetPasswordDialog }
