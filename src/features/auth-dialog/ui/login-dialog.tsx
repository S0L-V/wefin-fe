import '../../../app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { LockKeyhole, X } from 'lucide-react'

import { useLoginDialogQuery } from '../model/use-login-dialog-query'
import { useLoginDialogStore } from '../model/use-login-dialog-store'

function LoginDialog() {
  const isOpen = useLoginDialogStore((state) => state.isOpen)
  const setOpen = useLoginDialogStore((state) => state.setOpen)
  const { data } = useLoginDialogQuery()

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
                {data?.title ?? '로그인 모달'}
              </Dialog.Title>
              <Dialog.Description className="text-sm leading-6 text-slate-500">
                {data?.description ?? '로그인 폼이 들어갈 위치입니다.'}
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

          <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {data?.stack.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default LoginDialog
