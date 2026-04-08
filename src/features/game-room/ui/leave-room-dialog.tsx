import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { LogOut } from 'lucide-react'

interface LeaveRoomDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  isLeaving: boolean
}

function LeaveRoomDialog({ open, onConfirm, onCancel, isLeaving }: LeaveRoomDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <LogOut className="h-6 w-6 text-red-500" />
            </div>

            <div className="text-center">
              <Dialog.Title className="text-lg font-semibold text-wefin-text">
                방을 나가시겠습니까?
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-wefin-subtle">
                나가면 다시 입장해야 합니다.
              </Dialog.Description>
            </div>

            <div className="flex w-full gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLeaving}
                className="flex-1 rounded-xl border border-wefin-line py-3 text-sm font-medium text-wefin-text transition-colors hover:bg-wefin-bg disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLeaving}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {isLeaving ? '나가는 중...' : '나가기'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default LeaveRoomDialog
