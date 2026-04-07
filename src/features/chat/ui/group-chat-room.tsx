import { MessageSquareReply, Send, Users, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useGlobalChatStore } from '@/features/chat/model/global/global-chat-store'
import { useGroupChatStore } from '@/features/chat/model/group/group-chat-store'
import { useGroupChatSocket } from '@/features/chat/model/group/use-group-chat-socket'

export default function GroupChatRoom() {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const userId = useGlobalChatStore((state) => state.userId)
  const client = useGlobalChatStore((state) => state.client)
  const groupMeta = useGroupChatStore((state) => state.groupMeta)
  const chatMessages = useGroupChatStore((state) => state.messages)
  const connected = useGroupChatStore((state) => state.connected)
  const isLoading = useGroupChatStore((state) => state.loading)
  const errorMessage = useGroupChatStore((state) => state.errorMessage)
  const replyTarget = useGroupChatStore((state) => state.replyTarget)
  const sendMessage = useGroupChatStore((state) => state.sendMessage)
  const setReplyTarget = useGroupChatStore((state) => state.setReplyTarget)
  const clearReplyTarget = useGroupChatStore((state) => state.clearReplyTarget)

  useGroupChatSocket(userId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = () => {
    const didSend = sendMessage(client, message)
    if (!didSend) {
      return
    }

    setMessage('')
  }

  if (isLoading) {
    return <div className="h-[640px] p-6 text-sm text-gray-500">Loading group chat...</div>
  }

  if (errorMessage) {
    return <div className="h-[640px] p-6 text-sm text-red-500">{errorMessage}</div>
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
            <p className="text-xs text-gray-500">내 그룹 멤버만 참여할 수 있는 대화방</p>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">
          {connected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-white p-6 pr-20">
        {chatMessages.map((msg, index) => {
          const isMine = msg.userId === userId
          const isSystem = msg.messageType === 'SYSTEM'

          if (isSystem) {
            return (
              <div key={`${msg.messageId}-${index}`} className="flex justify-center">
                <div className="w-full max-w-[88%] rounded-xl border border-amber-300/70 bg-amber-100/75 px-4 py-3 text-center text-sm font-semibold leading-6 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                  {msg.content}
                </div>
              </div>
            )
          }

          return (
            <div
              key={`${msg.messageId}-${index}`}
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

              <div className="relative max-w-[70%]">
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
                  className="absolute right-[-56px] bottom-0 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600 shadow-sm transition hover:border-[#3db9b9]/40 hover:text-[#3db9b9]"
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
              <div className="truncate text-sm text-gray-600">{replyTarget.content}</div>
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
            onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
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
