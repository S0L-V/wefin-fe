import { X } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

const FORMSPREE_URL = 'https://formspree.io/f/mykljlzz'

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget

    setSending(true)
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
      if (res.ok) {
        toast.success('의견이 전송되었습니다. 감사합니다!')
        form.reset()
        onClose()
      } else {
        toast.error('전송에 실패했습니다. 다시 시도해 주세요.')
      }
    } catch {
      toast.error('전송에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setSending(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(12px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.2)'
        }}
        onClick={onClose}
      />
      <div className="relative w-[min(420px,calc(100vw-32px))] animate-[slideDown_0.2s_ease-out] rounded-2xl bg-wefin-surface p-6 shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-wefin-text">의견 보내기</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-bg"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-1 text-xs text-wefin-subtle">
          서비스 개선을 위한 소중한 의견을 보내주세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            name="name"
            type="text"
            placeholder="이름 (선택)"
            className="h-10 w-full rounded-xl border border-wefin-line px-3 text-sm outline-none transition-colors focus:border-wefin-mint"
          />
          <input
            name="email"
            type="email"
            placeholder="이메일 (선택)"
            className="h-10 w-full rounded-xl border border-wefin-line px-3 text-sm outline-none transition-colors focus:border-wefin-mint"
          />
          <textarea
            name="message"
            required
            rows={5}
            placeholder="어떤 점이 좋았는지, 개선되었으면 하는 점이 있다면 알려주세요."
            className="w-full resize-none rounded-xl border border-wefin-line px-3 py-2.5 text-sm outline-none transition-colors focus:border-wefin-mint"
          />
          <button
            type="submit"
            disabled={sending}
            className="h-10 w-full rounded-xl bg-wefin-mint text-sm font-semibold text-white transition-colors hover:bg-wefin-mint-deep disabled:opacity-50"
          >
            {sending ? '전송 중...' : '보내기'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}
