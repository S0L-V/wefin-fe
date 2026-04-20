import { useQueryClient } from '@tanstack/react-query'
import { ArrowUp, CornerDownRight, ListChecks, MessageSquareReply, Smile, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { emojiList, emojiMap, isEmojiCode } from '@/features/chat/lib/emoji-map'
import { useChatUnreadStore } from '@/features/chat/model/chat-unread-store'
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

const VOTE_COMMAND = '/vote'
const WEFINI_COMMAND = '/wefini'
const YOUNG_COMMAND = '/영'
const CHAT_COMMANDS = [
  { command: VOTE_COMMAND, description: '투표 만들기' },
  { command: WEFINI_COMMAND, description: '위피니에게 질문하기' },
  { command: YOUNG_COMMAND, description: '영차!' }
] as const

export default function GroupChatRoom({ bare = false }: GroupChatRoomProps = {}) {
  const [message, setMessage] = useState('')
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const unreadDividerRef = useRef<HTMLDivElement>(null)
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
  const visibleGroupUnreadLine = useChatUnreadStore((state) => state.visibleGroupUnreadLine)
  const visibleGroupReadMessageId = useChatUnreadStore((state) => state.visibleGroupReadMessageId)

  useGroupChatSocket(userId)

  const lastMessageKey = useMemo(() => getLastMessageKey(chatMessages), [chatMessages])
  const isVoteCommandInput =
    message.trim() === VOTE_COMMAND || message.trim().startsWith(`${VOTE_COMMAND} `)
  const commandSuggestions = useMemo(() => {
    const trimmed = message.trimStart()

    if (!trimmed.startsWith('/')) {
      return []
    }

    const hasWhitespaceAfterCommand = trimmed.includes(' ')
    if (hasWhitespaceAfterCommand) {
      return []
    }

    return CHAT_COMMANDS.filter(
      ({ command }) => command.startsWith(trimmed) || trimmed.startsWith(command)
    )
  }, [message])
  const firstUnreadIndex = useMemo(() => {
    if (!visibleGroupUnreadLine) {
      return -1
    }

    if (visibleGroupReadMessageId == null) {
      const firstUnreadMessage = chatMessages.find(
        (message) => message.userId !== userId || message.messageType === 'SYSTEM'
      )

      if (!firstUnreadMessage) {
        return -1
      }

      return chatMessages.findIndex(
        (message) => getMessageKey(message) === getMessageKey(firstUnreadMessage)
      )
    }

    return chatMessages.findIndex((message) => {
      if (message.messageId <= visibleGroupReadMessageId) {
        return false
      }

      return message.userId !== userId || message.messageType === 'SYSTEM'
    })
  }, [chatMessages, userId, visibleGroupReadMessageId, visibleGroupUnreadLine])

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

    const container = scrollContainerRef.current

    if (shouldRestoreScrollRef.current) {
      if (previousHeightRef.current != null) {
        container.scrollTop += container.scrollHeight - previousHeightRef.current
      }

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
  }, [firstUnreadIndex, isLoading, chatMessages.length])

  const handleCommandMessage = (trimmedMessage: string) => {
    if (trimmedMessage !== VOTE_COMMAND && !trimmedMessage.startsWith(`${VOTE_COMMAND} `)) {
      return false
    }

    setIsVoteModalOpen(true)
    setMessage('')
    return true
  }

  const handleCommandSuggestionClick = (command: (typeof CHAT_COMMANDS)[number]['command']) => {
    if (command === VOTE_COMMAND) {
      setIsVoteModalOpen(true)
      setMessage('')
      return
    }

    if (command === YOUNG_COMMAND) {
      setMessage(command)

      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
      return
    }

    setMessage(`${command} `)

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const applySelectedCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index]

    if (!selectedCommand) {
      return false
    }

    handleCommandSuggestionClick(selectedCommand.command)
    return true
  }

  const handleSendMessage = () => {
    const trimmedMessage = message.trim()

    if (handleCommandMessage(trimmedMessage)) {
      return
    }

    const didSend = sendMessage(client, message)
    if (!didSend) {
      return
    }

    refreshTodayQuestsAfterRealtimeAction(queryClient)
    setMessage('')
  }

  const handleSendEmoji = (emojiCode: keyof typeof emojiMap) => {
    const didSend = sendMessage(client, emojiCode)
    if (!didSend) {
      return
    }

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
        그룹 채팅을 불러오는 중...
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
          className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto bg-white p-3 scrollbar-thin"
        >
          {isLoadingOlder && (
            <div className="text-center text-xs text-wefin-subtle">
              이전 메시지를 불러오는 중...
            </div>
          )}

          {chatMessages.map((msg, index) => {
            const isMine = msg.userId === userId
            const isSystem = msg.messageType === 'SYSTEM'
            const isNews = msg.messageType === 'NEWS' && !!msg.newsShare
            const isVote = !!msg.voteShare
            const messageKey = getMessageKey(msg)

            return (
              <div key={messageKey}>
                {index === firstUnreadIndex && (
                  <div ref={unreadDividerRef}>
                    <UnreadDivider />
                  </div>
                )}

                {isSystem ? (
                  <div className="flex flex-col items-start">
                    <div className="mb-1 flex items-center gap-2">
                      <img
                        src="/wefin.png"
                        alt="위피니"
                        className="h-7 w-7 rounded-full border border-wefin-line object-cover"
                      />
                      <span className="text-xs font-bold text-wefin-mint-deep">위피니</span>
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-none border border-wefin-line bg-white px-3 py-2 text-sm leading-relaxed text-wefin-text shadow-sm [overflow-wrap:anywhere]">
                      <div className="whitespace-pre-wrap">{msg.content}</div>
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

                    if (isNews && msg.newsShare) {
                      const newsShare = msg.newsShare

                      return (
                        <div
                          className={`group/msg flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                        >
                          {!isMine && (
                            <span className="mb-1 text-xs font-bold text-wefin-text">
                              {msg.sender}
                            </span>
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
                            {time && (
                              <span className="pb-0.5 text-[10px] text-wefin-subtle">{time}</span>
                            )}
                            <ReplyButton onClick={() => setReplyTarget(msg)} />
                          </div>
                        </div>
                      )
                    }

                    if (isVote && msg.voteShare) {
                      return (
                        <InlineVoteCard
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
                        className={`group/msg flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        {!isMine && (
                          <span className="mb-1 text-xs font-bold text-wefin-text">
                            {msg.sender}
                          </span>
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
                              <span className="font-bold text-wefin-text">
                                {msg.replyTo.sender}
                              </span>
                              <span className="text-wefin-subtle">
                                {' 답장 '}
                                {isEmojiCode(msg.replyTo.content)
                                  ? '이모티콘'
                                  : msg.replyTo.content}
                              </span>
                            </span>
                          </div>
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
                                style={{
                                  transform: `scale(${emojiMap[msg.content].messageScale})`
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-snug [overflow-wrap:anywhere] ${
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
                          <ReplyButton onClick={() => setReplyTarget(msg)} />
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
                      : isEmojiCode(replyTarget.content)
                        ? '이모티콘'
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

          {commandSuggestions.length > 0 && (
            <div className="mb-2 overflow-hidden rounded-2xl border border-wefin-line bg-white shadow-sm">
              {commandSuggestions.map(({ command, description }) => (
                <button
                  key={command}
                  type="button"
                  onClick={() => handleCommandSuggestionClick(command)}
                  onMouseEnter={() =>
                    setSelectedCommandIndex(
                      commandSuggestions.findIndex((item) => item.command === command)
                    )
                  }
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
                    commandSuggestions[selectedCommandIndex]?.command === command
                      ? 'bg-wefin-bg'
                      : 'hover:bg-wefin-bg'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-wefin-text">{command}</span>
                    <span className="text-xs text-wefin-subtle">{description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pr-1.5 pl-4">
            <button
              type="button"
              onClick={() => {
                setIsEmojiPickerOpen(false)
                setIsVoteModalOpen(true)
              }}
              disabled={!groupId}
              aria-label="투표 만들기"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-wefin-line bg-white text-wefin-mint transition-colors hover:bg-wefin-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ListChecks size={17} />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                setSelectedCommandIndex(0)
                if (isEmojiPickerOpen) {
                  setIsEmojiPickerOpen(false)
                }
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) {
                  return
                }

                if (commandSuggestions.length > 0) {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setSelectedCommandIndex((prev) => (prev + 1) % commandSuggestions.length)
                    return
                  }

                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    setSelectedCommandIndex(
                      (prev) => (prev - 1 + commandSuggestions.length) % commandSuggestions.length
                    )
                    return
                  }

                  if (event.key === 'Tab') {
                    event.preventDefault()
                    applySelectedCommandSuggestion(selectedCommandIndex)
                    return
                  }

                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setMessage('')
                    return
                  }
                }

                if (event.key === 'Enter') {
                  if (commandSuggestions.length > 0 && message.trimStart().startsWith('/')) {
                    const selectedCommand = commandSuggestions[selectedCommandIndex]
                    const shouldExecuteImmediately =
                      selectedCommand?.command === YOUNG_COMMAND && message.trim() === YOUNG_COMMAND

                    if (!shouldExecuteImmediately) {
                      const didApplyCommand = applySelectedCommandSuggestion(selectedCommandIndex)

                      if (didApplyCommand) {
                        event.preventDefault()
                        return
                      }
                    }
                  }

                  const trimmedMessage = event.currentTarget.value.trim()

                  if (handleCommandMessage(trimmedMessage)) {
                    event.preventDefault()
                    return
                  }

                  handleSendMessage()
                }
              }}
              placeholder="/커맨드 또는 메시지를 입력하세요"
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
              disabled={!message.trim() || (!isVoteCommandInput && !client?.connected)}
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
  // hover 환경에선 평소 숨기고 메시지 hover/focus 시 노출
  // 터치(hover 미지원) 환경에선 항상 노출 — pointer:fine 미디어 쿼리로 분기
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="답장"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-wefin-subtle transition-opacity hover:bg-wefin-bg hover:text-wefin-mint-deep focus-visible:opacity-100 group-hover/msg:opacity-100 [@media(pointer:fine)]:opacity-0"
    >
      <MessageSquareReply size={16} />
    </button>
  )
}
