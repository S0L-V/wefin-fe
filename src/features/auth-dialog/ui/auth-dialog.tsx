import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useState } from 'react'

import { useLoginDialogQuery } from '../model/use-login-dialog-query'
import { useLoginDialogStore } from '../model/use-login-dialog-store'
import { useLoginForm } from '../model/use-login-form'
import { useSignupForm } from '../model/use-signup-form'
import { ResetPasswordDialog } from './reset-password-dialog'

function AuthDialog() {
  const isOpen = useLoginDialogStore((state) => state.isOpen)
  const mode = useLoginDialogStore((state) => state.mode)
  const setOpen = useLoginDialogStore((state) => state.setOpen)
  const switchMode = useLoginDialogStore((state) => state.switchMode)

  const [isResetOpen, setIsResetOpen] = useState(false)

  const { data } = useLoginDialogQuery()

  const {
    formData: loginFormData,
    loading: loginLoading,
    toastMsg,
    handleChange: handleLoginChange,
    handleSubmit: handleLoginSubmit
  } = useLoginForm({
    onSuccess: () => setOpen(false)
  })

  const {
    formData: signupFormData,
    fieldErrors,
    isEmailVerified,
    isCodeSent,
    verificationCode,
    codeCooldown,
    loading: signupLoading,
    isVerifying,
    handleChange: handleSignupChange,
    handleBlur,
    handleVerificationCodeChange,
    handleSendVerificationCode,
    handleConfirmVerificationCode,
    handleSubmit: handleSignupSubmit,
    inputClassName,
    verificationCodeInputClassName
  } = useSignupForm({
    onSuccess: () => {
      switchMode('login')
      setOpen(false)
    }
  })

  const isLogin = mode === 'login'

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            {isLogin && toastMsg && (
              <div className="mb-4 animate-[slideDown_0.2s_ease-out] rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-600 shadow-sm">
                {toastMsg}
              </div>
            )}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Dialog.Title className="text-xl font-semibold text-slate-900">
                  {isLogin ? (data?.title ?? '로그인') : '회원가입'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500">
                  {isLogin
                    ? (data?.description ?? '이메일과 비밀번호를 입력하세요')
                    : '새로운 계정을 만들고 시작하세요'}
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

            {isLogin ? (
              <>
                <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="login-email" className="sr-only">
                      이메일
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="이메일"
                      required
                      value={loginFormData.email}
                      onChange={handleLoginChange('email')}
                      className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-[#56c1c9]"
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password" className="sr-only">
                      비밀번호
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      placeholder="비밀번호"
                      required
                      value={loginFormData.password}
                      onChange={handleLoginChange('password')}
                      className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-[#56c1c9]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="h-12 w-full rounded-xl bg-[#56c1c9] text-sm font-semibold text-white transition-colors hover:bg-[#48b4bc] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loginLoading ? '로그인 중...' : '로그인'}
                  </button>
                </form>

                <p className="mt-3 text-right text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setIsResetOpen(true)
                    }}
                    className="hover:underline"
                  >
                    비밀번호를 잊어버리셨나요?
                  </button>
                </p>

                <p className="mt-6 text-center text-sm text-slate-500">
                  계정이 없으신가요?
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="ml-2 font-semibold text-[#56c1c9] hover:underline"
                  >
                    회원가입
                  </button>
                </p>
              </>
            ) : (
              <>
                <form onSubmit={handleSignupSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="signup-nickname" className="sr-only">
                      닉네임
                    </label>
                    <input
                      id="signup-nickname"
                      type="text"
                      placeholder="닉네임"
                      required
                      value={signupFormData.nickname}
                      onChange={handleSignupChange('nickname')}
                      onBlur={handleBlur('nickname')}
                      className={inputClassName('nickname')}
                    />
                    {fieldErrors.nickname ? (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.nickname}</p>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label htmlFor="signup-email" className="sr-only">
                          이메일
                        </label>
                        <input
                          id="signup-email"
                          type="email"
                          placeholder="이메일"
                          required
                          value={signupFormData.email}
                          onChange={handleSignupChange('email')}
                          onBlur={handleBlur('email')}
                          className={inputClassName('email')}
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
                          <label htmlFor="signup-verification-code" className="sr-only">
                            인증코드
                          </label>
                          <input
                            id="signup-verification-code"
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
                    <label htmlFor="signup-password" className="sr-only">
                      비밀번호
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      placeholder="비밀번호"
                      required
                      value={signupFormData.password}
                      onChange={handleSignupChange('password')}
                      onBlur={handleBlur('password')}
                      className={inputClassName('password')}
                    />
                    {fieldErrors.password ? (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="signup-confirm-password" className="sr-only">
                      비밀번호 확인
                    </label>
                    <input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="비밀번호 확인"
                      required
                      value={signupFormData.confirmPassword}
                      onChange={handleSignupChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      className={inputClassName('confirmPassword')}
                    />
                    {fieldErrors.confirmPassword ? (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={signupLoading || !isEmailVerified}
                    className="h-12 w-full rounded-xl bg-[#56c1c9] text-sm font-semibold text-white transition-colors hover:bg-[#48b4bc] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {signupLoading ? '처리 중...' : '회원가입'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  이미 계정이 있으신가요?
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="ml-2 font-semibold text-[#56c1c9] hover:underline"
                  >
                    로그인
                  </button>
                </p>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ResetPasswordDialog open={isResetOpen} onClose={() => setIsResetOpen(false)} />
    </>
  )
}

export default AuthDialog
