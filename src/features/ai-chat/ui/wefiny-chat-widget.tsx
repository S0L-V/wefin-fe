import axios from 'axios'
import { Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  type AiChatMessage,
  fetchAiChatMessages
} from '@/features/ai-chat/api/fetch-ai-chat-messages'
import { sendAiChatMessage } from '@/features/ai-chat/api/send-ai-chat-message'
import { useDemoUserId } from '@/features/chat/model/global/use-demo-user-id'

const AI_POLL_DELAY_MS = 2500
const AI_POLL_MAX_ATTEMPTS = 6
const SAME_MESSAGE_WINDOW_MS = 15000

type PendingStatus = 'idle' | 'thinking' | 'syncing'

type UserMessageSignature = {
  userId: string | null
  content: string
  createdAt: string
}

function getMessageKey(message: AiChatMessage, index: number): string {
  return [
    message.messageId ?? `temp-${index}`,
    message.userId ?? 'anonymous',
    message.role,
    message.content,
    message.createdAt
  ].join(':')
}

function getAiMarker(message: AiChatMessage): string | null {
  if (message.role !== 'AI') {
    return null
  }

  return message.messageId != null
    ? `id:${message.messageId}`
    : `temp:${message.content}:${message.createdAt}`
}

function getLatestAiMarker(messages: AiChatMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const marker = getAiMarker(messages[index])

    if (marker != null) {
      return marker
    }
  }

  return null
}

function toTimestamp(value: string): number {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function isLikelyPersistedUserMessage(
  message: AiChatMessage,
  signature: UserMessageSignature
): boolean {
  if (message.role !== 'USER') {
    return false
  }

  return (
    message.userId === signature.userId &&
    message.content === signature.content &&
    Math.abs(toTimestamp(message.createdAt) - toTimestamp(signature.createdAt)) <=
      SAME_MESSAGE_WINDOW_MS
  )
}

function isSameMessage(left: AiChatMessage, right: AiChatMessage): boolean {
  if (left.messageId != null && right.messageId != null) {
    return left.messageId === right.messageId
  }

  return (
    left.userId === right.userId &&
    left.role === right.role &&
    left.content === right.content &&
    left.createdAt === right.createdAt
  )
}

function mergeMessages(currentMessages: AiChatMessage[], incomingMessages: AiChatMessage[]) {
  const mergedMessages = [...incomingMessages]

  currentMessages.forEach((message) => {
    const alreadyExists = mergedMessages.some((item) => {
      if (isSameMessage(item, message)) {
        return true
      }

      return (
        message.messageId == null &&
        isLikelyPersistedUserMessage(item, {
          userId: message.userId,
          content: message.content,
          createdAt: message.createdAt
        })
      )
    })

    if (!alreadyExists) {
      mergedMessages.push(message)
    }
  })

  return mergedMessages.sort(
    (left, right) => toTimestamp(left.createdAt) - toTimestamp(right.createdAt)
  )
}

function hasRecoveredAiReply(
  messages: AiChatMessage[],
  previousAiMarker: string | null,
  userMessageSignature: UserMessageSignature
): boolean {
  const matchedUserIndex = messages.findIndex((message) =>
    isLikelyPersistedUserMessage(message, userMessageSignature)
  )

  if (matchedUserIndex < 0) {
    return false
  }

  return messages.slice(matchedUserIndex + 1).some((message) => {
    const marker = getAiMarker(message)

    return marker != null && marker !== previousAiMarker
  })
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function readHasAccessToken() {
  return typeof window !== 'undefined' && !!window.localStorage.getItem('accessToken')
}

export default function WefinyChatWidget() {
  const userId = useDemoUserId()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<PendingStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasAccessToken, setHasAccessToken] = useState(readHasAccessToken)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const syncRequestIdRef = useRef(0)
  const sessionVersionRef = useRef(0)

  useEffect(() => {
    const syncAuthState = () => {
      setHasAccessToken(readHasAccessToken())
    }

    window.addEventListener('auth-changed', syncAuthState)
    window.addEventListener('storage', syncAuthState)

    return () => {
      window.removeEventListener('auth-changed', syncAuthState)
      window.removeEventListener('storage', syncAuthState)
      sessionVersionRef.current += 1
    }
  }, [])

  useEffect(() => {
    if (hasAccessToken) {
      return
    }

    sessionVersionRef.current += 1
    setMessages([])
    setMessage('')
    setErrorMessage(null)
    setPendingStatus('idle')
    setIsLoading(false)
    setIsSending(false)
  }, [hasAccessToken])

  useEffect(() => {
    if (!isOpen || !hasAccessToken) {
      return
    }

    const sessionVersion = sessionVersionRef.current
    let active = true
    setIsLoading(true)
    setErrorMessage(null)

    fetchAiChatMessages()
      .then((page) => {
        if (!active || sessionVersionRef.current !== sessionVersion) {
          return
        }

        setMessages((current) => mergeMessages(current, page.messages))
        setIsLoading(false)
      })
      .catch((error) => {
        if (!active || sessionVersionRef.current !== sessionVersion) {
          return
        }

        console.error('Failed to load AI chat history:', error)
        setErrorMessage('위피니 채팅 이력을 불러오지 못했습니다.')
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [hasAccessToken, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isOpen, messages, pendingStatus])

  const syncAiHistory = async (sessionVersion: number, options?: { preserveError?: boolean }) => {
    const requestId = ++syncRequestIdRef.current

    try {
      const page = await fetchAiChatMessages()

      if (syncRequestIdRef.current !== requestId || sessionVersionRef.current !== sessionVersion) {
        return null
      }

      setMessages((current) => mergeMessages(current, page.messages))

      if (!options?.preserveError) {
        setErrorMessage(null)
      }

      return page.messages
    } catch (error) {
      console.error('Failed to sync AI chat history:', error)
      return null
    }
  }

  const recoverAiResponseAfterTimeout = async (
    previousAiMarker: string | null,
    userMessageSignature: UserMessageSignature,
    sessionVersion: number
  ) => {
    if (sessionVersionRef.current !== sessionVersion) {
      return
    }

    setPendingStatus('syncing')

    for (let attempt = 0; attempt < AI_POLL_MAX_ATTEMPTS; attempt += 1) {
      await wait(AI_POLL_DELAY_MS)

      if (sessionVersionRef.current !== sessionVersion) {
        return
      }

      const syncedMessages = await syncAiHistory(sessionVersion, { preserveError: true })

      if (
        syncedMessages != null &&
        hasRecoveredAiReply(syncedMessages, previousAiMarker, userMessageSignature)
      ) {
        if (sessionVersionRef.current !== sessionVersion) {
          return
        }

        setPendingStatus('idle')
        setErrorMessage(null)
        return
      }
    }

    if (sessionVersionRef.current !== sessionVersion) {
      return
    }

    setPendingStatus('idle')
    setErrorMessage('답변이 조금 늦어지고 있어요. 잠시 후 채팅을 다시 열면 최신 답변을 불러옵니다.')
  }

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || isSending || pendingStatus !== 'idle' || !hasAccessToken) {
      return
    }

    const sessionVersion = sessionVersionRef.current
    const optimisticUserMessage: AiChatMessage = {
      messageId: null,
      userId,
      role: 'USER',
      content: trimmedMessage,
      createdAt: new Date().toISOString()
    }

    const previousAiMarker = getLatestAiMarker(messages)
    const userMessageSignature: UserMessageSignature = {
      userId,
      content: trimmedMessage,
      createdAt: optimisticUserMessage.createdAt
    }

    setMessages((current) => [...current, optimisticUserMessage])
    setMessage('')
    setIsSending(true)
    setPendingStatus('thinking')
    setErrorMessage(null)

    try {
      const aiMessage = await sendAiChatMessage(trimmedMessage)

      if (sessionVersionRef.current !== sessionVersion) {
        return
      }

      setMessages((current) => mergeMessages(current, [aiMessage]))
      setPendingStatus('idle')
    } catch (error) {
      console.error('Failed to send AI chat message:', error)

      if (sessionVersionRef.current !== sessionVersion) {
        return
      }

      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        setErrorMessage('답변 생성이 조금 길어지고 있어요. 대화 내역을 다시 확인하는 중입니다.')
        void recoverAiResponseAfterTimeout(previousAiMarker, userMessageSignature, sessionVersion)
      } else {
        setMessages((current) => current.filter((item) => item !== optimisticUserMessage))
        setPendingStatus('idle')
        setErrorMessage('위피니 채팅 전송에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      if (sessionVersionRef.current === sessionVersion) {
        setIsSending(false)
      }
    }
  }

  const pendingLabel =
    pendingStatus === 'thinking'
      ? '위피니가 답변을 생각하고 있어요...'
      : pendingStatus === 'syncing'
        ? '위피니가 답변을 정리해서 가져오고 있어요...'
        : null

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed right-6 bottom-6 z-30 flex h-17 w-17 items-center justify-center overflow-hidden rounded-full border border-[#b8efe7] bg-linear-to-br from-[#1d9f8d] via-[#2bb6a4] to-[#6cd9cd] p-[3px] shadow-[0_24px_60px_rgba(24,122,112,0.26)] transition-transform hover:scale-[1.03]"
        aria-label={isOpen ? '위피니 채팅 닫기' : '위피니 채팅 열기'}
      >
        <div className="h-full w-full overflow-hidden rounded-full border border-white/80 bg-white">
          <img src="/wefini.png" alt="위피니 아이콘" className="h-full w-full object-cover" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed right-6 bottom-26 z-30 flex h-[620px] w-[380px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[28px] border border-[#b8efe7] bg-white shadow-[0_30px_80px_rgba(16,91,83,0.22)] max-md:right-3 max-md:bottom-24 max-md:h-[72vh] max-md:w-[calc(100vw-24px)]">
          <div className="flex items-center justify-between border-b border-[#bfeae3] bg-linear-to-r from-[#dff8f3] via-[#f5fffd] to-[#e5faf7] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-[#9fe0d5] bg-linear-to-br from-[#1d9f8d] via-[#2bb6a4] to-[#6cd9cd] p-[2px] shadow-sm">
                <div className="h-full w-full overflow-hidden rounded-[14px] bg-white">
                  <img src="/wefini.png" alt="위피니" className="h-full w-full object-cover" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[1rem] font-bold text-gray-900">
                  위피니 채팅
                  <Sparkles size={14} className="text-[#1d9f8d]" />
                </div>
                <p className="text-xs text-gray-500">
                  투자 아이디어와 종목 궁금증을 바로 물어보세요.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white hover:text-gray-600"
              aria-label="위피니 채팅 닫기"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(75,199,183,0.13),_transparent_45%),linear-gradient(180deg,#fbfefe_0%,#f7fbfb_100%)] px-4 py-5">
            {!hasAccessToken ? (
              <div className="mt-10 rounded-2xl border border-dashed border-[#c7ebe5] bg-white/80 px-5 py-6 text-center text-sm leading-6 text-gray-500">
                위피니 채팅은 로그인 후 사용할 수 있습니다.
              </div>
            ) : isLoading ? (
              <div className="mt-10 text-center text-sm text-gray-500">대화를 불러오는 중...</div>
            ) : (
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="rounded-2xl border border-[#d7f2ee] bg-white/90 px-4 py-4 text-sm leading-6 text-gray-600">
                    안녕하세요! 종목 전망, 재무 지표, 시장 흐름처럼 궁금한 내용을 편하게 물어보세요.
                  </div>
                )}

                {messages.map((chatMessage, index) => {
                  const isMine = chatMessage.userId === userId && chatMessage.role === 'USER'

                  return (
                    <div
                      key={getMessageKey(chatMessage, index)}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-[82%] items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {!isMine && (
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#9fe0d5] bg-linear-to-br from-[#1d9f8d] via-[#2bb6a4] to-[#6cd9cd] p-[1px]">
                            <div className="h-full w-full overflow-hidden rounded-full bg-white">
                              <img
                                src="/wefini.png"
                                alt="위피니"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                        <div
                          className={`rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                            isMine
                              ? 'rounded-br-md bg-[#1d9f8d] text-white'
                              : 'rounded-bl-md border border-[#daf2ed] bg-white text-gray-800'
                          }`}
                        >
                          {!isMine && (
                            <div className="mb-1 text-[11px] font-bold text-[#1d9f8d]">위피니</div>
                          )}
                          <div>{chatMessage.content}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {pendingLabel && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[82%] items-end gap-2">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#9fe0d5] bg-linear-to-br from-[#1d9f8d] via-[#2bb6a4] to-[#6cd9cd] p-[1px]">
                        <div className="h-full w-full overflow-hidden rounded-full bg-white">
                          <img
                            src="/wefini.png"
                            alt="위피니"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="rounded-[22px] rounded-bl-md border border-[#daf2ed] bg-white px-4 py-3 text-sm leading-6 text-gray-700 shadow-sm">
                        <div className="mb-1 text-[11px] font-bold text-[#1d9f8d]">위피니</div>
                        <div className="flex items-center gap-2">
                          <span>{pendingLabel}</span>
                          <span className="flex items-center gap-1 text-[#1d9f8d]">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-[#d7f2ee] bg-white px-4 py-4">
            {errorMessage && (
              <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {errorMessage}
              </div>
            )}

            <div className="flex items-end gap-2 rounded-[24px] border border-[#d7f2ee] bg-[#f9fcfc] p-2">
              <textarea
                aria-label="위피니 채팅 메시지 입력"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing) {
                    return
                  }

                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void handleSendMessage()
                  }
                }}
                placeholder={
                  hasAccessToken ? '예: 삼성전자 전망 알려줘' : '로그인 후 이용할 수 있어요'
                }
                disabled={!hasAccessToken || isSending || pendingStatus !== 'idle'}
                rows={1}
                className="max-h-32 min-h-[48px] flex-1 resize-none border-none bg-transparent px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-400"
              />
              <button
                type="button"
                onClick={() => {
                  void handleSendMessage()
                }}
                disabled={
                  !message.trim() || !hasAccessToken || isSending || pendingStatus !== 'idle'
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1d9f8d] text-white transition hover:bg-[#16786b] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="위피니 채팅 전송"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
