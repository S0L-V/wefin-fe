import { useQueryClient } from '@tanstack/react-query'
import { ArrowUp, Smile } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { emojiList, emojiMap, isEmojiCode } from '@/features/chat/lib/emoji-map'
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
      <div className="h-px flex-1 bg-slate-200" />
      <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
        새 메시지
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

export default function GlobalChatRoom({ bare = false }: GlobalChatRoomProps = {}) {
  const [message, setMessage] = useState('')
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const queryClient = useQueryClient()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const unreadDividerRef = useRef<HTMLDivElement>(null)
  const previousHeightRef = useRef<number | null>(null)
  const shouldRestoreScrollRef = useRef(false)
  const previousLastMessageKeyRef = useRef('')

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

  const lastMessageKey = useMemo(() => getLastMessageKey(chatMessages), [chatMessages])
  const firstUnreadIndex = useMemo(() => {
    if (!visibleGlobalUnreadLine) {
      return -1
    }

    if (visibleGlobalReadMessageId == null) {
      const firstUnreadMessage = chatMessages.find(
        (message) => message.userId !== userId || message.role === 'SYSTEM'
      )

      if (!firstUnreadMessage) {
        return -1
      }

      return chatMessages.findIndex(
        (message) => getMessageKey(message) === getMessageKey(firstUnreadMessage)
      )
    }

    const latestMyMessageId = chatMessages.reduce<number | null>((latest, message) => {
      if (message.userId !== userId || message.messageId == null) {
        return latest
      }

      if (message.messageId <= visibleGlobalReadMessageId) {
        return latest
      }

      return latest == null || message.messageId > latest ? message.messageId : latest
    }, null)

    const effectiveReadMessageId =
      latestMyMessageId != null && latestMyMessageId > visibleGlobalReadMessageId
        ? latestMyMessageId
        : visibleGlobalReadMessageId

    return chatMessages.findIndex((message) => {
      if (message.messageId == null || message.messageId <= effectiveReadMessageId) {
        return false
      }

      return message.userId !== userId || message.role === 'SYSTEM'
    })
  }, [chatMessages, userId, visibleGlobalReadMessageId, visibleGlobalUnreadLine])

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
    if (isLoading || chatMessages.length === 0 || !scrollContainerRef.current) {
      return
    }

    if (firstUnreadIndex >= 0 && unreadDividerRef.current) {
      unreadDividerRef.current.scrollIntoView({
        block: 'center'
      })
      return
    }

    const container = scrollContainerRef.current
    container.scrollTop = container.scrollHeight
  }, [firstUnreadIndex, isLoading, chatMessages.length])

  const handleSendMessage = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || !client?.connected) return

    sendMessage(trimmedMessage)
    refreshTodayQuestsAfterRealtimeAction(queryClient)
    setMessage('')
  }

  const handleSendEmoji = (emojiCode: keyof typeof emojiMap) => {
    if (!client?.connected) return

    sendMessage(emojiCode)
    refreshTodayQuestsAfterRealtimeAction(queryClient)
    setIsEmojiPickerOpen(false)
  }

  const handleScroll = async () => {
    const container = scrollContainerRef.current

    if (!container || container.scrollTop > 80 || !hasNext || isLoadingOlder) {
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
      <div className={`${bare ? 'h-full' : 'h-[640px]'} p-6 text-sm text-wefin-subtle`}>
        Loading global chat...
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden ${
        bare ? 'h-full' : 'h-[640px] rounded-2xl border border-wefin-line bg-white shadow-sm'
      }`}
    >
      {errorMessage && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={() => {
          void handleScroll()
        }}
        className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto bg-white p-3 scrollbar-thin"
      >
        {isLoadingOlder && (
          <div className="text-center text-xs text-wefin-subtle">이전 메시지를 불러오는 중...</div>
        )}

        {chatMessages.map((msg, index) => {
          const isMine = msg.userId === userId
          const isSystem = msg.role === 'SYSTEM'

          return (
            <div key={getMessageKey(msg)}>
              {index === firstUnreadIndex && (
                <div ref={unreadDividerRef}>
                  <UnreadDivider />
                </div>
              )}

              {isSystem ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-[88%] rounded-xl border border-amber-300/70 bg-amber-100/75 px-4 py-3 text-center text-sm font-semibold leading-6 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
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
                                : 'rounded-tl-none bg-gray-100 text-wefin-text'
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

      <div className="border-t border-wefin-line bg-white p-3">
        {isEmojiPickerOpen && (
          <div className="mb-2 rounded-2xl border border-wefin-line bg-white p-3 shadow-sm">
            <div className="mb-2 text-xs font-semibold text-wefin-subtle">이모티콘</div>
            <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
              {emojiList.map(({ code, src, pickerScale }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSendEmoji(code)}
                  className="flex aspect-square items-center justify-center rounded-2xl bg-wefin-bg p-2 transition hover:bg-wefin-mint-soft"
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

        <div className="flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pr-1.5 pl-4">
          <input
            type="text"
            value={message}
            onChange={(event) => {
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
            placeholder="메시지를 입력하세요"
            className="h-9 flex-1 border-none bg-transparent text-sm text-wefin-text focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
            aria-label="이모티콘 열기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-wefin-line bg-white text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-mint-deep"
          >
            <Smile size={17} />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !client?.connected}
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
