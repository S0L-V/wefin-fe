import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import ChatPanel from '@/features/chat/ui/chat-panel'

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-5 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-wefin-mint text-white shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all hover:bg-wefin-mint-deep hover:shadow-[0_6px_28px_rgba(20,184,166,0.5)] active:scale-95 lg:hidden"
        aria-label={open ? '채팅 닫기' : '채팅 열기'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-30 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 bottom-0 left-0 flex h-[70dvh] flex-col overflow-hidden rounded-t-2xl bg-wefin-surface shadow-[0_-8px_32px_rgba(0,0,0,0.15)]">
              <div className="flex shrink-0 items-center justify-center py-2">
                <div className="h-1 w-10 rounded-full bg-wefin-line-2" />
              </div>
              <div className="min-h-0 flex-1">
                <ChatPanel />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
