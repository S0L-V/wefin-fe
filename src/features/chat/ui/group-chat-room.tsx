import { MessageSquareReply, Send, Users, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGlobalChatStore } from '@/features/chat/model/global/global-chat-store'
import { useGroupChatStore } from '@/features/chat/model/group/group-chat-store'
import { useGroupChatSocket } from '@/features/chat/model/group/use-group-chat-socket'

function getLastMessageKey(messages: ReturnType<typeof useGroupChatStore.getState>['messages']) {
  const lastMessage = messages[messages.length - 1]

  if (!lastMessage) {
    return ''
  }

  return [
    lastMessage.messageId,
    lastMessage.userId ?? 'anonymous',
    lastMessage.messageType,
    lastMessage.content,
    lastMessage.createdAt
  ].join(':')
}

function getMessageKey(
  message: ReturnType<typeof useGroupChatStore.getState>['messages'][number]
): string {
  return [
    message.messageId,
    message.userId ?? 'anonymous',
    message.messageType,
    message.content,
    message.createdAt
  ].join(':')
}

export default function GroupChatRoom() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const previousHeightRef = useRef<number | null>(null)
  const shouldRestoreScrollRef = useRef(false)
  const previousLastMessageKeyRef = useRef('')

  const userId = useGlobalChatStore((state) => state.userId)
  const client = useGlobalChatStore((state) => state.client)
  const groupMeta = useGroupChatStore((state) => state.groupMeta)
  const chatMessages = useGroupChatStore((state) => state.messages)
  const connected = useGroupChatStore((state) => state.connected)
  const isLoading = useGroupChatStore((state) => state.loading)
  const isLoadingOlder = useGroupChatStore((state) => state.loadingOlder)
  const hasNext = useGroupChatStore((state) => state.hasNext)
  const errorMessage = useGroupChatStore((state) => state.errorMessage)
  const replyTarget = useGroupChatStore((state) => state.replyTarget)
  const sendMessage = useGroupChatStore((state) => state.sendMessage)
  const setReplyTarget = useGroupChatStore((state) => state.setReplyTarget)
  const clearReplyTarget = useGroupChatStore((state) => state.clearReplyTarget)
  const loadOlderMessages = useGroupChatStore((state) => state.loadOlderMessages)

  useGroupChatSocket(userId)

  const lastMessageKey = useMemo(() => getLastMessageKey(chatMessages), [chatMessages])

  useEffect(() => {
    const shouldScrollToBottom =
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
  }, [lastMessageKey])

  useLayoutEffect(() => {
    if (isLoading || chatMessages.length === 0 || !scrollContainerRef.current) {
      return
    }

    const container = scrollContainerRef.current
    container.scrollTop = container.scrollHeight
  }, [isLoading, chatMessages.length])

  const handleSendMessage = () => {
    const didSend = sendMessage(client, message)
    if (!didSend) {
      return
    }

    setMessage('')
  }

  const handleScroll = async () => {
    const container = scrollContainerRef.current

    if (!container || container.scrollTop > 80 || !hasNext || isLoadingOlder) {
      return
    }

    // 이전 메시지를 붙이기 전에 현재 높이를 기록해 두고, 성공했을 때만 scrollTop을 보정한다.
    previousHeightRef.current = container.scrollHeight
    shouldRestoreScrollRef.current = true

    const didLoadOlderMessages = await loadOlderMessages()

    if (!didLoadOlderMessages) {
      shouldRestoreScrollRef.current = false
      previousHeightRef.current = null
    }
  }

  if (isLoading) {
    return <div className="h-[640px] p-6 text-sm text-gray-500">Loading group chat...</div>
  }

  return (
    <div className="flex h-[640px] min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3db9b9]/10 text-[#3db9b9]">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{groupMeta?.groupName ?? '그룹 채팅'}</h3>
            <p className="text-xs text-gray-500">현재 그룹 멤버만 참여할 수 있는 대화방</p>
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
        className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-white p-6 pr-6"
      >
        {isLoadingOlder && (
          <div className="text-center text-xs text-gray-400">이전 메시지를 불러오는 중...</div>
        )}

        {chatMessages.map((msg) => {
          const isMine = msg.userId === userId
          const isSystem = msg.messageType === 'SYSTEM'
          const isNews = msg.messageType === 'NEWS' && !!msg.newsShare

          if (isSystem) {
            return (
              <div key={getMessageKey(msg)} className="flex justify-center">
                <div className="w-full max-w-[88%] rounded-xl border border-amber-300/70 bg-amber-100/75 px-4 py-3 text-center text-sm font-semibold leading-6 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                  {msg.content}
                </div>
              </div>
            )
          }

          if (isNews && msg.newsShare) {
            const newsShare = msg.newsShare

            return (
              <div
                key={getMessageKey(msg)}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`mb-1 flex items-baseline gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                >
                  <span className="text-xs font-bold text-gray-700">{msg.sender}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className={`relative w-full max-w-[340px] ${isMine ? 'mr-0' : ''}`}>
                  <button
                    type="button"
                    onClick={() => navigate(`/news/${newsShare.newsClusterId}`)}
                    className="w-full overflow-hidden rounded-[22px] border border-black/5 bg-[#1f1f1f] text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {newsShare.thumbnailUrl ? (
                      <img
                        src={newsShare.thumbnailUrl}
                        alt={newsShare.title}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#273b57] to-[#1f1f1f] text-sm font-semibold text-white/70">
                        뉴스 미리보기
                      </div>
                    )}

                    <div className="space-y-3 p-4 text-white">
                      <div className="line-clamp-2 text-[15px] font-bold leading-6">
                        {newsShare.title}
                      </div>
                      {newsShare.summary && (
                        <p className="line-clamp-3 text-sm leading-6 text-white/75">
                          {newsShare.summary}
                        </p>
                      )}
                      <div className="text-sm font-semibold text-[#7ecbff] underline underline-offset-4">
                        news 상세 보기
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReplyTarget(msg)}
                    className={`absolute ${isMine ? 'left-[-56px]' : 'right-[-56px]'} bottom-0 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600 shadow-sm transition hover:border-[#3db9b9]/40 hover:text-[#3db9b9]`}
                  >
                    <MessageSquareReply size={12} />
                    답장
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={getMessageKey(msg)}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div className={`mb-1 flex items-baseline gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                <span className="text-xs font-bold text-gray-700">{msg.sender}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className={`relative max-w-[70%] ${isMine ? 'mr-0' : ''}`}>
                <div
                  className={`rounded-2xl p-3 text-sm ${
                    isMine
                      ? 'rounded-tr-none bg-[#3db9b9] text-white'
                      : 'rounded-tl-none bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.replyTo && (
                    <div
                      className={`mb-3 rounded-xl border px-3 py-2 text-xs ${
                        isMine
                          ? 'border-white/20 bg-white/10 text-white/85'
                          : 'border-gray-200 bg-white text-gray-500'
                      }`}
                    >
                      <div className="mb-1 font-semibold">{msg.replyTo.sender}</div>
                      <div className="line-clamp-2">{msg.replyTo.content}</div>
                    </div>
                  )}

                  <div>{msg.content}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setReplyTarget(msg)}
                  className={`absolute ${isMine ? 'left-[-56px]' : 'right-[-56px]'} bottom-0 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600 shadow-sm transition hover:border-[#3db9b9]/40 hover:text-[#3db9b9]`}
                >
                  <MessageSquareReply size={12} />
                  답장
                </button>
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        {replyTarget && (
          <div className="mb-3 flex items-start justify-between rounded-xl border border-[#3db9b9]/20 bg-[#3db9b9]/5 px-4 py-3">
            <div className="min-w-0">
              <div className="mb-1 text-xs font-bold text-[#2a8282]">
                {replyTarget.sender}에게 답장
              </div>
              <div className="truncate text-sm text-gray-600">
                {replyTarget.messageType === 'NEWS' && replyTarget.newsShare
                  ? replyTarget.newsShare.title
                  : replyTarget.content}
              </div>
            </div>
            <button
              type="button"
              onClick={clearReplyTarget}
              className="ml-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-white hover:text-gray-600"
              aria-label="답장 취소"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-2 pr-3">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) {
                return
              }

              if (event.key === 'Enter') {
                handleSendMessage()
              }
            }}
            placeholder="메시지를 입력하세요... (/slow, /rename 등 명령어 사용 가능)"
            className="flex-1 border-none bg-transparent px-4 py-2 text-sm text-gray-900 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !client?.connected}
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
