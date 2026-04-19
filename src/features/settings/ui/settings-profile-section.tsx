import { useState } from 'react'
import { ZodError } from 'zod'

import { changePasswordSchema } from '@/features/auth-dialog/model/change-password.schema'
import { useChangePasswordMutation } from '@/features/auth-dialog/model/use-change-password-mutation'
import { ApiError } from '@/shared/api/base-api'

type SettingsProfileSectionProps = {
  isLoggedIn: boolean
  emailPlaceholder: string
}

type PasswordFormErrors = {
  currentPassword?: string
  newPassword?: string
  newPasswordConfirm?: string
  form?: string
}

function SettingsProfileSection({ isLoggedIn, emailPlaceholder }: SettingsProfileSectionProps) {
  const nickname = isLoggedIn ? (localStorage.getItem('nickname') ?? '') : ''

  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [errors, setErrors] = useState<PasswordFormErrors>({})
  const [successMessage, setSuccessMessage] = useState('')

  const changePasswordMutation = useChangePasswordMutation()

  const resetPasswordForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setNewPasswordConfirm('')
    setErrors({})
    setSuccessMessage('')
  }

  const handleTogglePasswordForm = () => {
    if (isPasswordFormOpen) {
      resetPasswordForm()
    }
    setIsPasswordFormOpen((prev) => !prev)
  }

  const handleSubmitPasswordChange = async () => {
    setErrors({})
    setSuccessMessage('')

    try {
      changePasswordSchema.parse({
        currentPassword,
        newPassword,
        newPasswordConfirm
      })
    } catch (error) {
      if (error instanceof ZodError) {
        const nextErrors: PasswordFormErrors = {}

        error.issues.forEach((issue) => {
          const field = issue.path[0]
          if (
            field === 'currentPassword' ||
            field === 'newPassword' ||
            field === 'newPasswordConfirm'
          ) {
            nextErrors[field] = issue.message
          }
        })

        setErrors(nextErrors)
        return
      }
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword
      })

      setSuccessMessage('비밀번호가 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    } catch (error) {
      if (error instanceof ApiError) {
        if (
          error.code === 'AUTH_VALIDATION_FAILED' &&
          error.data &&
          typeof error.data === 'object'
        ) {
          const fieldErrors = error.data as Record<string, string>

          setErrors({
            currentPassword: fieldErrors.currentPassword,
            newPassword: fieldErrors.newPassword
          })
          return
        }

        if (error.code === 'AUTH_PASSWORD_MISMATCH') {
          setErrors({
            currentPassword: '현재 비밀번호가 일치하지 않습니다.'
          })
          return
        }

        if (error.code === 'AUTH_PASSWORD_SAME_AS_OLD') {
          setErrors({
            newPassword: '새 비밀번호는 기존 비밀번호와 달라야 합니다.'
          })
          return
        }

        if (error.code === 'AUTH_UNAUTHORIZED') {
          setErrors({
            form: '로그인이 필요합니다. 다시 로그인해주세요.'
          })
          return
        }

        setErrors({
          form: error.message
        })
        return
      }

      setErrors({
        form: '비밀번호 변경 중 오류가 발생했습니다.'
      })
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-lg font-bold text-wefin-text">프로필 설정</h3>
        <div className="divide-y divide-wefin-line/70">
          <SettingRow
            title="닉네임"
            description="서비스에서 표시될 이름입니다."
            action={
              <input
                defaultValue={nickname}
                placeholder="닉네임 입력"
                disabled={!isLoggedIn}
                maxLength={12}
                className="h-9 w-[200px] rounded-lg border border-wefin-line bg-white px-3 text-sm text-wefin-text outline-none transition-colors placeholder:text-wefin-subtle focus:border-wefin-mint disabled:bg-wefin-bg disabled:text-wefin-subtle"
              />
            }
          />

          <SettingRow
            title="이메일 주소"
            description="로그인에 사용되는 이메일입니다."
            action={
              <span className="text-sm font-medium text-wefin-subtle">
                {isLoggedIn ? emailPlaceholder : '로그인 후 표시'}
              </span>
            }
          />

          <div className="py-4">
            <SettingRow
              title="비밀번호"
              description="보안을 위해 주기적으로 변경하세요."
              action={
                <button
                  type="button"
                  disabled={!isLoggedIn}
                  onClick={handleTogglePasswordForm}
                  className="h-8 rounded-lg border border-wefin-line px-3 text-xs font-semibold text-wefin-text transition-colors hover:bg-wefin-bg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPasswordFormOpen ? '닫기' : '변경하기'}
                </button>
              }
            />

            {isLoggedIn && isPasswordFormOpen && (
              <div className="mt-4 rounded-xl border border-wefin-line/70 bg-wefin-bg/40 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-wefin-text">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="현재 비밀번호 입력"
                      className={`h-10 w-full max-w-[320px] rounded-lg border bg-white px-3 text-sm text-wefin-text outline-none transition-colors placeholder:text-wefin-subtle focus:border-wefin-mint ${
                        errors.currentPassword ? 'border-red-400' : 'border-wefin-line'
                      }`}
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-wefin-text">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="새 비밀번호 입력"
                      className={`h-10 w-full max-w-[320px] rounded-lg border bg-white px-3 text-sm text-wefin-text outline-none transition-colors placeholder:text-wefin-subtle focus:border-wefin-mint ${
                        errors.newPassword ? 'border-red-400' : 'border-wefin-line'
                      }`}
                    />
                    <p className="mt-1 text-xs text-wefin-subtle">
                      8~20자, 영문과 숫자를 포함해야 합니다.
                    </p>
                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-wefin-text">
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      placeholder="새 비밀번호 다시 입력"
                      className={`h-10 w-full max-w-[320px] rounded-lg border bg-white px-3 text-sm text-wefin-text outline-none transition-colors placeholder:text-wefin-subtle focus:border-wefin-mint ${
                        errors.newPasswordConfirm ? 'border-red-400' : 'border-wefin-line'
                      }`}
                    />
                    {errors.newPasswordConfirm && (
                      <p className="mt-1 text-xs text-red-500">{errors.newPasswordConfirm}</p>
                    )}
                  </div>

                  {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}
                  {successMessage && (
                    <p className="text-sm font-medium text-wefin-mint-deep">{successMessage}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSubmitPasswordChange}
                      disabled={changePasswordMutation.isPending}
                      className="h-9 rounded-lg bg-wefin-mint-deep px-4 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {changePasswordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPasswordFormOpen(false)
                        resetPasswordForm()
                      }}
                      className="h-9 rounded-lg border border-wefin-line px-4 text-sm font-semibold text-wefin-text transition-colors hover:bg-wefin-bg"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-wefin-text">보안 인증</h3>
        <SettingRow
          title="2단계 인증 (2FA)"
          description="로그인 시 추가 보안 코드를 요구하여 계정을 보호합니다."
          action={
            <button
              type="button"
              disabled
              aria-label="2단계 인증 토글"
              className="relative h-6 w-11 cursor-not-allowed rounded-full bg-wefin-line opacity-60"
            >
              <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white" />
            </button>
          }
        />
      </section>
    </div>
  )
}

function SettingRow({
  title,
  description,
  action
}: {
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0 space-y-1">
        <p className="text-base font-semibold text-wefin-text">{title}</p>
        <p className="text-sm text-wefin-subtle">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

export default SettingsProfileSection
