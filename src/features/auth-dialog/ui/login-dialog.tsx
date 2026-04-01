import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { LockKeyhole, X } from 'lucide-react'

import { useLoginDialogQuery } from '../model/use-login-dialog-query'
import { useLoginDialogStore } from '../model/use-login-dialog-store'
import { useSignupForm } from '../model/use-signup-form'

function LoginDialog() {
  const isOpen = useLoginDialogStore((state) => state.isOpen)
  const setOpen = useLoginDialogStore((state) => state.setOpen)
  const { data } = useLoginDialogQuery()

  const {
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
  } = useSignupForm({
    onSuccess: () => setOpen(false)
  })

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-[34px] min-w-[88px] items-center justify-center rounded-[9px] bg-[#56c1c9] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#48b4bc]"
        >
          로그인
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-wefin-mint-soft px-3 py-1 text-xs font-semibold text-wefin-mint">
                <LockKeyhole className="size-3.5" />
                Radix UI Dialog
              </div>
              <Dialog.Title className="text-xl font-semibold text-slate-900">
                {data?.title ?? '회원가입'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">
                {data?.description ?? '새로운 계정을 만들고 시작하세요'}
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
              <input
                type="text"
                placeholder="닉네임"
                required
                value={formData.nickname}
                onChange={handleChange('nickname')}
                onBlur={handleBlur('nickname')}
                className={inputClassName('nickname')}
              />
              {fieldErrors.nickname ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.nickname}</p>
              ) : null}
            </div>

            <div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="이메일"
                  required
                  value={formData.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  className={inputClassName('email')}
                />
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={isEmailVerified || isVerifying}
                  className="rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isVerifying ? '확인 중...' : isEmailVerified ? '인증됨' : '인증하기'}
                </button>
              </div>
              {fieldErrors.email ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
              ) : isEmailVerified ? (
                <p className="mt-1 text-sm text-emerald-600">이메일 인증이 완료되었습니다.</p>
              ) : null}
            </div>

            <div>
              <input
                type="password"
                placeholder="비밀번호"
                required
                value={formData.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                className={inputClassName('password')}
              />
              {fieldErrors.password ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
              ) : null}
            </div>

            <div>
              <input
                type="password"
                placeholder="비밀번호 확인"
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

            <div>
              <input
                type="text"
                placeholder="초대코드 (선택)"
                value={formData.inviteCode}
                onChange={handleChange('inviteCode')}
                onBlur={handleBlur('inviteCode')}
                className={inputClassName('inviteCode')}
              />
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#56c1c9] text-sm font-semibold text-white transition-colors hover:bg-[#48b4bc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('kakao')}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Kakao
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default LoginDialog
