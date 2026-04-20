import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import ChartCanvas from './chart-canvas'

interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'danger' | 'primary'
  icon?: ReactNode
}

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmVariant = 'primary',
  icon
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  const confirmClass =
    confirmVariant === 'danger'
      ? 'bg-rose-500 text-white hover:bg-rose-600'
      : 'bg-wefin-mint-deep text-white hover:bg-[#0a6f71]'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(10, 16, 28, 0.85)' }}
        onClick={onCancel}
      >
        <ChartCanvas />
      </div>
      <div
        ref={dialogRef}
        className="relative w-[340px] animate-[slideDown_0.2s_ease-out] rounded-2xl bg-white px-6 py-7 shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
      >
        {icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
            {icon}
          </div>
        )}
        <h3 className="text-center text-lg font-bold text-wefin-text">{title}</h3>
        {description && <p className="mt-2 text-center text-sm text-wefin-subtle">{description}</p>}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-wefin-line py-3 text-sm font-semibold text-wefin-text transition-colors hover:bg-wefin-bg"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
