import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { LockKeyhole, X } from 'lucide-react'

import { useLoginDialogQuery } from '../model/use-login-dialog-query'
import { useLoginDialogStore } from '../model/use-login-dialog-store'
import { useLoginForm } from '../model/use-login-form'

function LoginDialog() {
  const isOpen = useLoginDialogStore((state) => state.isOpen)
  const setOpen = useLoginDialogStore((state) => state.setOpen)
  const { data } = useLoginDialogQuery()

  const { formData, error, loading, handleChange, handleSubmit } = useLoginForm({
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
                {data?.title ?? '로그인'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">
                {data?.description ?? '이메일과 비밀번호를 입력하세요'}
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
                type="email"
                placeholder="이메일"
                required
                value={formData.email}
                onChange={handleChange('email')}
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-[#56c1c9]"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="비밀번호"
                required
                value={formData.password}
                onChange={handleChange('password')}
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-[#56c1c9]"
              />
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#56c1c9] text-sm font-semibold text-white transition-colors hover:bg-[#48b4bc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default LoginDialog
