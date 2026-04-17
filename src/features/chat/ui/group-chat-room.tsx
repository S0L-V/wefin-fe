import { useQueryClient } from '@tanstack/react-query'
import { ArrowUp, CornerDownRight, ListChecks, MessageSquareReply, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGlobalChatStore } from '@/features/chat/model/global/global-chat-store'
import { useGroupChatStore } from '@/features/chat/model/group/group-chat-store'
import { useGroupChatSocket } from '@/features/chat/model/group/use-group-chat-socket'
import { refreshTodayQuestsAfterRealtimeAction } from '@/features/quest/model/use-today-quests'
import CreateVoteModal from '@/features/vote/ui/create-vote-modal'
import InlineVoteCard from '@/features/vote/ui/inline-vote-card'

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

interface GroupChatRoomProps {
  bare?: boolean
}

export default function GroupChatRoom({ bare = false }: GroupChatRoomProps = {}) {
  const [message, setMessage] = useState('')
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const previousHeightRef = useRef<number | null>(null)
  const shouldRestoreScrollRef = useRef(false)
  const previousLastMessageKeyRef = useRef('')

  const userId = useGlobalChatStore((state) => state.userId)
  const client = useGlobalChatStore((state) => state.client)
  const chatMessages = useGroupChatStore((state) => state.messages)
  const isLoading = useGroupChatStore((state) => state.loading)
  const isLoadingOlder = useGroupChatStore((state) => state.loadingOlder)
  const hasNext = useGroupChatStore((state) => state.hasNext)
  const errorMessage = useGroupChatStore((state) => state.errorMessage)
  const replyTarget = useGroupChatStore((state) => state.replyTarget)
  const groupId = useGroupChatStore((state) => state.groupMeta?.groupId ?? null)
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

    refreshTodayQuestsAfterRealtimeAction(queryClient)
    setMessage('')
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
        Loading group chat...
      </div>
    )
  }

  return (
    <>
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
          className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-white p-3 scrollbar-thin"
        >
          {isLoadingOlder && (
            <div className="text-center text-xs text-wefin-subtle">
              <div className="text-center text-xs text-wefin-subtle">
                이전 메시지를 불러오는 중...
              </div>
            </div>
          )}

          {chatMessages.map((msg) => {
            const isMine = msg.userId === userId
            const isSystem = msg.messageType === 'SYSTEM'
            const isNews = msg.messageType === 'NEWS' && !!msg.newsShare
            const isVote = !!msg.voteShare

            if (isSystem) {
              return (
                <div key={getMessageKey(msg)} className="flex justify-center">
                  <div className="w-full max-w-[88%] rounded-xl border border-amber-300/70 bg-amber-100/75 px-4 py-3 text-center text-sm font-semibold leading-6 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                    {msg.content}
                  </div>
                </div>
              )
            }

            const time = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : ''

            if (isNews && msg.newsShare) {
              const newsShare = msg.newsShare

              return (
                <div
                  key={getMessageKey(msg)}
                  className={`group/msg flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  {!isMine && (
                    <span className="mb-1 text-xs font-bold text-wefin-text">{msg.sender}</span>
                  )}

                  <div
                    className={`flex w-full items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/news/${newsShare.newsClusterId}`)}
                      className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-[#1f1f1f] text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {newsShare.thumbnailUrl ? (
                        <img
                          src={newsShare.thumbnailUrl}
                          alt={newsShare.title}
                          className="h-28 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#273b57] to-[#1f1f1f] text-xs font-semibold text-white/70">
                          뉴스 미리보기
                        </div>
                      )}
                      <div className="space-y-1.5 p-3">
                        <div className="line-clamp-2 text-sm font-bold leading-snug">
                          {newsShare.title}
                        </div>
                        {newsShare.summary && (
                          <p className="line-clamp-2 text-xs leading-snug text-white/70">
                            {newsShare.summary}
                          </p>
                        )}
                      </div>
                    </button>
                    {time && <span className="pb-0.5 text-[10px] text-wefin-subtle">{time}</span>}
                    <ReplyButton onClick={() => setReplyTarget(msg)} />
                  </div>
                </div>
              )
            }

            if (isVote && msg.voteShare) {
              return (
                <InlineVoteCard
                  key={getMessageKey(msg)}
                  voteShare={msg.voteShare}
                  isMine={isMine}
                  sender={msg.sender}
                  time={time}
                  onReply={() => setReplyTarget(msg)}
                />
              )
            }

            return (
              <div
                key={getMessageKey(msg)}
                className={`group/msg flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                {!isMine && (
                  <span className="mb-1 text-xs font-bold text-wefin-text">{msg.sender}</span>
                )}

                {msg.replyTo && (
                  <div
                    className={`mb-1 inline-flex max-w-[70%] items-start gap-1 rounded-lg border border-wefin-line bg-wefin-bg px-2.5 py-1 text-[11px] leading-snug [overflow-wrap:anywhere] ${
                      isMine ? 'flex-row-reverse text-right' : ''
                    }`}
                  >
                    <CornerDownRight
                      size={11}
                      className="mt-0.5 shrink-0 text-wefin-subtle opacity-80"
                    />
                    <span>
                      <span className="font-bold text-wefin-text">{msg.replyTo.sender}</span>
                      <span className="text-wefin-subtle">
                        {' 답장 '}
                        {msg.replyTo.content}
                      </span>
                    </span>
                  </div>
                )}

                <div
                  className={`flex w-full items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-snug [overflow-wrap:anywhere] ${
                      isMine
                        ? 'rounded-tr-none bg-wefin-mint text-white'
                        : 'rounded-tl-none bg-gray-100 text-wefin-text'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {time && <span className="pb-0.5 text-[10px] text-wefin-subtle">{time}</span>}
                  <ReplyButton onClick={() => setReplyTarget(msg)} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-wefin-line bg-white p-3">
          {replyTarget && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-wefin-mint-soft/50 px-3 py-2">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-wefin-mint-deep">
                  {replyTarget.sender}에게 답장
                </div>
                <div className="truncate text-xs text-wefin-subtle">
                  {replyTarget.messageType === 'NEWS' && replyTarget.newsShare
                    ? replyTarget.newsShare.title
                    : replyTarget.voteShare
                      ? replyTarget.voteShare.title
                      : replyTarget.content}
                </div>
              </div>
              <button
                type="button"
                onClick={clearReplyTarget}
                className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-wefin-subtle transition hover:bg-white"
                aria-label="답장 취소"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pr-1.5 pl-4">
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
              placeholder="메시지를 입력하세요"
              className="h-9 flex-1 border-none bg-transparent text-sm text-wefin-text focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setIsVoteModalOpen(true)}
              disabled={!groupId}
              aria-label="투표 만들기"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-wefin-line bg-white text-wefin-mint transition-colors hover:bg-wefin-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ListChecks size={17} />
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

      <CreateVoteModal open={isVoteModalOpen} onOpenChange={setIsVoteModalOpen} groupId={groupId} />
    </>
  )
}

function ReplyButton({ onClick }: { onClick: () => void }) {
  // hover ?섍꼍?먯꽑 ?됱냼 ?④린怨?硫붿떆吏 hover/focus ???몄텧
  // ?곗튂(hover 誘몄??? ?섍꼍?먯꽑 ??긽 ?몄텧 ??pointer:fine 誘몃뵒??荑쇰━濡?遺꾧린
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="?듭옣"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-wefin-subtle transition-opacity hover:bg-wefin-bg hover:text-wefin-mint-deep focus-visible:opacity-100 group-hover/msg:opacity-100 [@media(pointer:fine)]:opacity-0"
    >
      <MessageSquareReply size={16} />
    </button>
  )
}
