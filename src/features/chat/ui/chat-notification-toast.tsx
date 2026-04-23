import { toast } from 'sonner'

import type { ChatUnreadNotification } from '@/features/chat/api/chat-unread'

const TOAST_DURATION = 2000
const CONTENT_MAX_LENGTH = 42

function getChatTypeLabel(chatType: ChatUnreadNotification['chatType']) {
  return chatType === 'GROUP' ? '그룹 채팅' : '전체 채팅'
}

function truncateContent(content: string) {
  if (content.length <= CONTENT_MAX_LENGTH) {
    return content
  }

  return `${content.slice(0, CONTENT_MAX_LENGTH)}...`
}

function getAvatarFallback(sender: string) {
  const trimmedSender = sender.trim()

  if (!trimmedSender) {
    return 'W'
  }

  return trimmedSender[0]?.toUpperCase() ?? 'W'
}

export function showChatInAppToast(payload: ChatUnreadNotification) {
  const preview = truncateContent(payload.content)
  const chatTypeLabel = getChatTypeLabel(payload.chatType)

  toast.custom(
    () => (
      <div className="flex min-w-[280px] max-w-[360px] items-start gap-3 rounded-2xl border border-wefin-line/80 bg-wefin-surface px-4 py-3 shadow-[0_18px_48px_-18px_rgba(15,23,42,0.28)]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-wefin-mint text-lg font-bold text-white">
          {getAvatarFallback(payload.sender)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="truncate text-sm font-bold text-wefin-text">{payload.sender}</span>
            <span className="rounded-full bg-wefin-surface-2 px-2 py-0.5 text-[11px] font-semibold text-wefin-subtle">
              {chatTypeLabel}
            </span>
          </div>
          <p className="line-clamp-2 text-sm leading-5 text-wefin-text-2">{preview}</p>
        </div>
      </div>
    ),
    {
      duration: TOAST_DURATION,
      position: 'bottom-left'
    }
  )
}
