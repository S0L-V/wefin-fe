import { useQueryClient } from '@tanstack/react-query'
import { ArrowUp, Smile } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { emojiList, emojiMap, isEmojiCode } from '@/features/chat/lib/emoji-map'
import {
  getChatClearBeforeMessageId,
  removeChatClearBeforeMessageId,
  setChatClearBeforeMessageId
} from '@/features/chat/model/chat-message-visibility'
import { useChatUnreadStore } from '@/features/chat/model/chat-unread-store'
import { useGlobalChatStore } from '@/features/chat/model/global/global-chat-store'
import { refreshTodayQuestsAfterRealtimeAction } from '@/features/quest/model/use-today-quests'

function getLastMessageKey(messages: ReturnType<typeof useGlobalChatStore.getState>['messages']) {
  const lastMessage = messages[messages.length - 1]

  if (!lastMessage) {
    return ''
  }

  return [
    lastMessage.messageId ?? 'temp',
    lastMessage.userId ?? 'anonymous',
    lastMessage.role,
    lastMessage.content,
    lastMessage.createdAt
  ].join(':')
}

function getMessageKey(
  message: ReturnType<typeof useGlobalChatStore.getState>['messages'][number]
): string {
  return [
    message.messageId ?? 'temp',
    message.userId ?? 'anonymous',
    message.role,
    message.content,
    message.createdAt
  ].join(':')
}

interface GlobalChatRoomProps {
  bare?: boolean
}

function UnreadDivider() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-wefin-line" />
      <span className="shrink-0 rounded-full border border-wefin-line bg-wefin-surface-2 px-2.5 py-1 text-[11px] font-medium text-wefin-subtle">
        새 메시지
      </span>
      <div className="h-px flex-1 bg-wefin-line" />
    </div>
  )
}

export default function GlobalChatRoom({ bare = false }: GlobalChatRoomProps = {}) {
  const [message, setMessage] = useState('')
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [clearBeforeMessageIds, setClearBeforeMessageIds] = useState<Record<string, number | null>>(
    {}
  )
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const unreadDividerRef = useRef<HTMLDivElement>(null)
  const previousHeightRef = useRef<number | null>(null)
  const shouldRestoreScrollRef = useRef(false)
  const previousLastMessageKeyRef = useRef('')

  const authUserId = useAuthUserId()
  const userId = useGlobalChatStore((state) => state.userId)
  const client = useGlobalChatStore((state) => state.client)
  const chatMessages = useGlobalChatStore((state) => state.messages)
  const isLoading = useGlobalChatStore((state) => state.loading)
  const isLoadingOlder = useGlobalChatStore((state) => state.loadingOlder)
  const hasNext = useGlobalChatStore((state) => state.hasNext)
  const errorMessage = useGlobalChatStore((state) => state.errorMessage)
  const sendMessage = useGlobalChatStore((state) => state.sendMessage)
  const loadOlderMessages = useGlobalChatStore((state) => state.loadOlderMessages)
  const visibleGlobalUnreadLine = useChatUnreadStore((state) => state.visibleGlobalUnreadLine)
  const visibleGlobalReadMessageId = useChatUnreadStore((state) => state.visibleGlobalReadMessageId)
  const dismissUnreadLine = useChatUnreadStore((state) => state.dismissUnreadLine)
  const isLoggedIn = !!authUserId
  const canSendMessage = isLoggedIn && !!client?.connected && !!userId

  const clearStorageKey = `GLOBAL:${userId ?? 'anonymous'}`
  const clearBeforeMessageId =
    userId && clearStorageKey in clearBeforeMessageIds
      ? clearBeforeMessageIds[clearStorageKey]
      : userId
        ? getChatClearBeforeMessageId(userId, 'GLOBAL')
        : null

  const visibleMessages = useMemo(
    () =>
      chatMessages.filter(
        (chatMessage) =>
          clearBeforeMessageId == null ||
          chatMessage.messageId == null ||
          chatMessage.messageId > clearBeforeMessageId
      ),
    [chatMessages, clearBeforeMessageId]
  )
  const lastMessageKey = useMemo(() => getLastMessageKey(visibleMessages), [visibleMessages])
  const firstUnreadIndex = useMemo(() => {
    if (!visibleGlobalUnreadLine) {
      return -1
    }

    if (visibleGlobalReadMessageId == null) {
      const firstUnreadMessage = visibleMessages.find(
        (message) => message.userId !== userId || message.role === 'SYSTEM'
      )

      if (!firstUnreadMessage) {
        return -1
      }

      return visibleMessages.findIndex(
        (message) => getMessageKey(message) === getMessageKey(firstUnreadMessage)
      )
    }

    return visibleMessages.findIndex((message) => {
      if (message.messageId == null || message.messageId <= visibleGlobalReadMessageId) {
        return false
      }

      return message.userId !== userId || message.role === 'SYSTEM'
    })
  }, [userId, visibleGlobalReadMessageId, visibleGlobalUnreadLine, visibleMessages])

  useEffect(() => {
    const shouldScrollToBottom =
      firstUnreadIndex < 0 &&
      !shouldRestoreScrollRef.current &&
      !!lastMessageKey &&
      previousLastMessageKeyRef.current !== lastMessageKey

    if (shouldScrollToBottom && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }

    previousLastMessageKeyRef.current = lastMessageKey
  }, [firstUnreadIndex, lastMessageKey])

  useLayoutEffect(() => {
    if (isLoading || visibleMessages.length === 0 || !scrollContainerRef.current) {
      return
    }

    const container = scrollContainerRef.current

    if (shouldRestoreScrollRef.current && previousHeightRef.current != null) {
      const previousHeight = previousHeightRef.current
      const nextHeight = container.scrollHeight

      container.scrollTop += nextHeight - previousHeight
      shouldRestoreScrollRef.current = false
      previousHeightRef.current = null
      return
    }

    if (firstUnreadIndex >= 0 && unreadDividerRef.current) {
      unreadDividerRef.current.scrollIntoView({
        block: 'center'
      })
      return
    }
    container.scrollTop = container.scrollHeight
  }, [firstUnreadIndex, isLoading, visibleMessages.length])

  const handleSendMessage = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    if (trimmedMessage === '/clear') {
      const latestMessageId = chatMessages.reduce<number | null>((latest, chatMessage) => {
        if (chatMessage.messageId == null) {
          return latest
        }

        return latest == null || chatMessage.messageId > latest ? chatMessage.messageId : latest
      }, null)

      if (latestMessageId != null && userId) {
        setChatClearBeforeMessageId(userId, 'GLOBAL', latestMessageId)
        setClearBeforeMessageIds((current) => ({
          ...current,
          [clearStorageKey]: latestMessageId
        }))
      }

      dismissUnreadLine('GLOBAL')
      setMessage('')
      return
    }

    if (trimmedMessage === '/unclear') {
      if (userId) {
        removeChatClearBeforeMessageId(userId, 'GLOBAL')
      }

      setClearBeforeMessageIds((current) => ({
        ...current,
        [clearStorageKey]: null
      }))
      setMessage('')
      return
    }

    if (!canSendMessage) return

    dismissUnreadLine('GLOBAL')
    sendMessage(trimmedMessage)
    refreshTodayQuestsAfterRealtimeAction(queryClient)
    setMessage('')
  }

  const handleSendEmoji = (emojiCode: keyof typeof emojiMap) => {
    if (!canSendMessage) return

    dismissUnreadLine('GLOBAL')
    sendMessage(emojiCode)
    refreshTodayQuestsAfterRealtimeAction(queryClient)
    setIsEmojiPickerOpen(false)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleScroll = async () => {
    const container = scrollContainerRef.current

    if (!container) {
      return
    }

    if (visibleGlobalUnreadLine && unreadDividerRef.current) {
      const containerRect = container.getBoundingClientRect()
      const dividerRect = unreadDividerRef.current.getBoundingClientRect()
      const isPastUnreadLine = dividerRect.bottom <= containerRect.top
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <= 24

      if (isPastUnreadLine || isNearBottom) {
        dismissUnreadLine('GLOBAL')
      }
    }

    if (container.scrollTop > 80 || !hasNext || isLoadingOlder) {
      return
    }

    previousHeightRef.current = container.scrollHeight
    shouldRestoreScrollRef.current = true

    const didLoadOlderMessages = await loadOlderMessages()

    if (!didLoadOlderMessages) {
      shouldRestoreScrollRef.current = false
      previousHeightRef.current = null
    }
  }

  if (isLoading) {
    return (
      <div
        className={`${bare ? 'h-full' : 'h-[calc(100dvh-220px)] min-h-[280px]'} flex items-start justify-center pt-6`}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-wefin-subtle/40"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden ${
        bare
          ? 'h-full'
          : 'h-[calc(100dvh-220px)] min-h-[280px] rounded-2xl border border-wefin-line bg-wefin-surface shadow-sm'
      }`}
    >
      {errorMessage && (
        <div className="border-b border-wefin-line bg-wefin-amber-soft px-4 py-3 text-sm text-wefin-amber-text">
          {errorMessage}
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={() => {
          void handleScroll()
        }}
        className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto bg-wefin-surface px-4 py-3 scrollbar-thin"
      >
        {isLoadingOlder && (
          <div className="text-center text-xs text-wefin-subtle">이전 메시지를 불러오는 중...</div>
        )}

        {visibleMessages.map((msg, index) => {
          const isMine = msg.userId === userId
          const isSystem = msg.role === 'SYSTEM'

          return (
            <div key={getMessageKey(msg)}>
              {index === firstUnreadIndex && (
                <div ref={unreadDividerRef}>
                  <UnreadDivider />
                </div>
              )}

              {isSystem && msg.content.includes('님이') && msg.content.includes('에서') ? (
                <ProfitShareCard content={msg.content} />
              ) : isSystem ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-[88%] rounded-xl border border-wefin-amber/30 bg-wefin-amber-soft px-4 py-3 text-center text-sm font-semibold leading-6 text-wefin-amber-text shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                    {msg.content}
                  </div>
                </div>
              ) : (
                (() => {
                  const time = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : ''

                  return (
                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {!isMine && (
                        <span className="mb-1 text-xs font-bold text-wefin-text">{msg.sender}</span>
                      )}

                      <div
                        className={`flex w-full items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}
                      >
                        {isEmojiCode(msg.content) ? (
                          <div className="rounded-3xl bg-transparent p-0.5">
                            <img
                              src={emojiMap[msg.content].src}
                              alt={msg.content}
                              className="h-24 w-24 object-contain sm:h-28 sm:w-28"
                              style={{ transform: `scale(${emojiMap[msg.content].messageScale})` }}
                            />
                          </div>
                        ) : (
                          <div
                            className={`max-w-[70%] rounded-2xl px-3 py-1.5 text-sm leading-snug [overflow-wrap:anywhere] ${
                              isMine
                                ? 'rounded-tr-none bg-wefin-mint text-white'
                                : 'rounded-tl-none bg-wefin-line text-wefin-text'
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
                        {time && (
                          <span className="pb-0.5 text-[10px] text-wefin-subtle">{time}</span>
                        )}
                      </div>
                    </div>
                  )
                })()
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-wefin-line bg-wefin-surface p-3">
        {isEmojiPickerOpen && (
          <div className="mb-2 rounded-2xl border border-wefin-line bg-wefin-surface p-3 shadow-sm">
            <div className="mb-2 text-xs font-semibold text-wefin-subtle">이모티콘</div>
            <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
              {emojiList.map(({ code, src, pickerScale }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSendEmoji(code)}
                  disabled={!canSendMessage}
                  className="flex aspect-square items-center justify-center rounded-2xl bg-wefin-bg p-2 transition hover:bg-wefin-mint-soft disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`${code} 이모티콘 보내기`}
                >
                  <img
                    src={src}
                    alt={code}
                    className="h-14 w-14 object-contain"
                    style={{ transform: `scale(${pickerScale})` }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="mb-2 rounded-2xl border border-wefin-line bg-wefin-surface-2 px-3 py-2 text-xs text-wefin-subtle">
            로그인하면 전체 채팅에 참여할 수 있어요.
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-full bg-wefin-surface-2 py-1.5 pr-1.5 pl-4">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(event) => {
              if (!isLoggedIn) {
                return
              }
              setMessage(event.target.value)
              if (isEmojiPickerOpen) {
                setIsEmojiPickerOpen(false)
              }
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) {
                return
              }

              if (event.key === 'Enter') {
                handleSendMessage()
              }
            }}
            placeholder={isLoggedIn ? '메시지를 입력하세요' : '로그인 후 채팅에 참여할 수 있어요'}
            disabled={!isLoggedIn}
            className="h-9 flex-1 border-none bg-transparent text-sm text-wefin-text focus:outline-none disabled:cursor-not-allowed disabled:text-wefin-subtle"
          />
          <button
            type="button"
            onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
            disabled={!canSendMessage}
            aria-label="이모티콘 열기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-wefin-muted transition-colors hover:bg-wefin-line hover:text-wefin-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Smile size={20} />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !canSendMessage}
            aria-label="메시지 전송"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wefin-mint text-white transition-colors hover:bg-wefin-mint-deep disabled:opacity-40"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProfitShareCard({ content }: { content: string }) {
  const match = content.match(/(.+?)님이\s+(.+?)에서\s+(-?[\d,]+)원/)
  const isLoss = content.includes('잃었') || content.includes('안타깝') || content.includes('손실')
  const nickname = match?.[1]?.replace('축하합니다! ', '').replace('안타깝네요. ', '') ?? ''
  const stockName = match?.[2] ?? ''
  const amountStr = match?.[3] ?? '0'
  const amountNum = Number(amountStr.replace(/,/g, ''))
  const isProfit = !isLoss && amountNum >= 0
  const displayAmount = Math.abs(amountNum).toLocaleString()

  return (
    <div className="flex justify-center">
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-wefin-surface px-4 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ${isProfit ? 'ring-wefin-red/25' : 'ring-wefin-blue/25'}`}
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${isProfit ? 'bg-wefin-red' : 'bg-wefin-blue'}`}
        />
        <span className="text-[12.5px] font-semibold text-wefin-text">{nickname}</span>
        <span className="text-[12.5px] font-semibold text-wefin-text">{stockName}</span>
        <span
          className={`font-num text-[13px] font-bold tracking-tight ${isProfit ? 'text-wefin-red' : 'text-wefin-blue'}`}
        >
          {isProfit ? '+' : '-'}
          {displayAmount}원
        </span>
      </div>
    </div>
  )
}
