import { Globe, Send } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useGlobalChatStore } from '@/features/chat/model/global/global-chat-store'

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

export default function GlobalChatRoom() {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const previousHeightRef = useRef<number | null>(null)
  const shouldRestoreScrollRef = useRef(false)
  const previousLastMessageKeyRef = useRef('')

  const userId = useGlobalChatStore((state) => state.userId)
  const chatMessages = useGlobalChatStore((state) => state.messages)
  const connected = useGlobalChatStore((state) => state.connected)
  const isLoading = useGlobalChatStore((state) => state.loading)
  const isLoadingOlder = useGlobalChatStore((state) => state.loadingOlder)
  const hasNext = useGlobalChatStore((state) => state.hasNext)
  const errorMessage = useGlobalChatStore((state) => state.errorMessage)
  const sendMessage = useGlobalChatStore((state) => state.sendMessage)
  const loadOlderMessages = useGlobalChatStore((state) => state.loadOlderMessages)

  const lastMessageKey = useMemo(() => getLastMessageKey(chatMessages), [chatMessages])

  useEffect(() => {
    const shouldScrollToBottom =
      !shouldRestoreScrollRef.current &&
      !!lastMessageKey &&
      previousLastMessageKeyRef.current !== lastMessageKey

    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    previousLastMessageKeyRef.current = lastMessageKey
  }, [lastMessageKey])

  useLayoutEffect(() => {
    if (
      !shouldRestoreScrollRef.current ||
      !scrollContainerRef.current ||
      previousHeightRef.current == null
    ) {
      return
    }

    const container = scrollContainerRef.current
    const heightDiff = container.scrollHeight - previousHeightRef.current
    container.scrollTop += heightDiff

    shouldRestoreScrollRef.current = false
    previousHeightRef.current = null
  }, [chatMessages])

  const handleSendMessage = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || !connected) return

    sendMessage(trimmedMessage)
    setMessage('')
  }

  const handleScroll = async () => {
    const container = scrollContainerRef.current

    if (!container || container.scrollTop > 80 || !hasNext || isLoadingOlder) {
      return
    }

    // 이전 메시지를 앞에 붙인 뒤에도 사용자가 보고 있던 위치를 유지하기 위해
    // 불러오기 전 높이를 저장해두고 렌더링 후 scrollTop을 보정한다.
    previousHeightRef.current = container.scrollHeight
    shouldRestoreScrollRef.current = true

    await loadOlderMessages()
  }

  if (isLoading) {
    return <div className="h-[640px] p-6 text-sm text-gray-500">Loading global chat...</div>
  }

  return (
    <div className="flex h-[640px] min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3db9b9]/10 text-[#3db9b9]">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Global Chat</h3>
            <p className="text-xs text-gray-500">A shared room visible across the app.</p>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">
          {connected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

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
        className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-white p-6"
      >
        {isLoadingOlder && (
          <div className="text-center text-xs text-gray-400">이전 메시지를 불러오는 중...</div>
        )}

        {chatMessages.map((msg, index) => {
          const isMine = msg.userId === userId
          const isSystem = msg.role === 'SYSTEM'

          if (isSystem) {
            return (
              <div key={`${msg.messageId ?? 'temp'}-${index}`} className="flex justify-center">
                <div className="w-full max-w-[88%] rounded-xl border border-amber-300/70 bg-amber-100/75 px-4 py-3 text-center text-sm font-semibold leading-6 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                  {msg.content}
                </div>
              </div>
            )
          }

          return (
            <div
              key={`${msg.messageId ?? 'temp'}-${index}`}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div className={`mb-1 flex items-baseline gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                <span className="text-xs font-bold text-gray-700">{msg.sender}</span>
                <span className="text-[10px] text-gray-400">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : ''}
                </span>
              </div>

              <div
                className={`max-w-[70%] rounded-2xl p-3 text-sm ${
                  isMine
                    ? 'rounded-tr-none bg-[#3db9b9] text-white'
                    : 'rounded-tl-none bg-gray-100 text-gray-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-2 pr-3">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 border-none bg-transparent px-4 py-2 text-sm text-gray-900 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !connected}
            aria-label="메시지 전송"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3db9b9] text-white transition-colors hover:bg-[#2a8282] disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
