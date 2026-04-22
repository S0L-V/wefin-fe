import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Maximize2, Minimize2, Send, X } from 'lucide-react'
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react'

import {
  type AiChatMessage,
  fetchAiChatMessages
} from '@/features/ai-chat/api/fetch-ai-chat-messages'
import { sendAiChatMessage } from '@/features/ai-chat/api/send-ai-chat-message'
import {
  getLatestAiMarker,
  getLatestPersistedUserMessage,
  getMessageKey,
  hasRecoveredAiReply,
  mergeMessages,
  readHasAccessToken,
  type UserMessageSignature,
  wait
} from '@/features/ai-chat/lib/wefini-chat-utils'
import {
  type PendingAiPrompt,
  useWefiniChatStore
} from '@/features/ai-chat/model/use-wefini-chat-store'
import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { invalidateTodayQuests } from '@/features/quest/model/use-today-quests'
import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

const AI_POLL_DELAY_MS = 2500
const AI_POLL_MAX_ATTEMPTS = 6

type PendingStatus = 'idle' | 'thinking' | 'syncing'

export default function WefinyChatWidget() {
  const userId = useAuthUserId()
  const queryClient = useQueryClient()
  const isOpen = useWefiniChatStore((s) => s.isOpen)
  const toggle = useWefiniChatStore((s) => s.toggle)
  const close = useWefiniChatStore((s) => s.close)
  const pendingPrompt = useWefiniChatStore((s) => s.pendingPrompt)
  const consumePendingPrompt = useWefiniChatStore((s) => s.consumePendingPrompt)
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<PendingStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [hasAccessToken, setHasAccessToken] = useState(readHasAccessToken)
  const widgetRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const syncRequestIdRef = useRef(0)
  const sessionVersionRef = useRef(0)
  const wasOpenRef = useRef(false)
  const shouldJumpToBottomRef = useRef(false)
  const previousMessageCountRef = useRef(0)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        close()
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, close])

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

  useLayoutEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false
      shouldJumpToBottomRef.current = false
      previousMessageCountRef.current = 0
      return
    }

    if (!wasOpenRef.current) {
      shouldJumpToBottomRef.current = true
    }

    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: shouldJumpToBottomRef.current ? 'auto' : 'smooth'
    })

    const messageCount = messages.length
    const didAppendMessages = previousMessageCountRef.current < messageCount

    if (shouldJumpToBottomRef.current && didAppendMessages) {
      shouldJumpToBottomRef.current = false
    }

    previousMessageCountRef.current = messageCount
    wasOpenRef.current = true
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

  const handleSendMessage = async (
    overrideMessage?: string,
    options?: { newsClusterId?: number; ignoreLoading?: boolean }
  ) => {
    const trimmedMessage = (overrideMessage ?? message).trim()

    if (
      !trimmedMessage ||
      (!options?.ignoreLoading && isLoading) ||
      isSending ||
      pendingStatus !== 'idle' ||
      !hasAccessToken
    ) {
      return
    }

    if (options?.ignoreLoading) {
      setIsLoading(false)
    }

    const sessionVersion = sessionVersionRef.current
    const latestPersistedUserMessage = getLatestPersistedUserMessage(messages)
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
      createdAt: optimisticUserMessage.createdAt,
      afterMessageId: latestPersistedUserMessage?.messageId ?? null,
      afterCreatedAt: latestPersistedUserMessage?.createdAt ?? null
    }

    setMessages((current) => [...current, optimisticUserMessage])
    setMessage('')
    setIsSending(true)
    setPendingStatus('thinking')
    setErrorMessage(null)

    try {
      const aiMessage = await sendAiChatMessage(trimmedMessage, {
        newsClusterId: options?.newsClusterId
      })

      if (sessionVersionRef.current !== sessionVersion) {
        return
      }

      setMessages((current) => mergeMessages(current, [aiMessage]))
      setPendingStatus('idle')
      void invalidateTodayQuests(queryClient)
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

  const sendPendingPrompt = useEffectEvent((prompt: PendingAiPrompt) => {
    void handleSendMessage(prompt.message, {
      newsClusterId: prompt.newsClusterId,
      ignoreLoading: true
    })
  })

  useEffect(() => {
    if (
      !isOpen ||
      pendingPrompt === null ||
      !hasAccessToken ||
      isSending ||
      pendingStatus !== 'idle'
    ) {
      return
    }

    const prompt = consumePendingPrompt()
    if (prompt === null) {
      return
    }

    sendPendingPrompt(prompt)
  }, [
    isOpen,
    pendingPrompt,
    hasAccessToken,
    isLoading,
    isSending,
    pendingStatus,
    consumePendingPrompt
  ])

  const pendingLabel =
    pendingStatus === 'thinking'
      ? '위피니가 답변을 생각하고 있어요...'
      : pendingStatus === 'syncing'
        ? '위피니가 답변을 정리해서 가져오고 있어요...'
        : null

  return (
    <div ref={widgetRef}>
      <button
        type="button"
        onClick={toggle}
        className="fixed right-6 bottom-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1a8a8c] to-[#0f6b6d] text-white shadow-[0_4px_16px_rgba(36,168,171,0.3)] ring-2 ring-wefin-mint-soft transition-all duration-300 hover:scale-110 hover:from-[#24a8ab] hover:to-[#1a8a8c] hover:shadow-[0_8px_28px_rgba(36,168,171,0.4)] active:scale-95"
        aria-label={isOpen ? '위피니 채팅 닫기' : '위피니 채팅 열기'}
      >
        {isOpen ? <X size={22} /> : <WefinLogoIcon size={24} />}
      </button>

      {isOpen && (
        <div
          className={`fixed right-6 bottom-[88px] z-30 flex max-h-[calc(100dvh-108px)] flex-col overflow-hidden rounded-2xl border border-wefin-line bg-wefin-surface shadow-sm transition-all duration-300 max-md:right-3 max-md:bottom-[80px] max-md:h-[72vh] max-md:w-[calc(100vw-24px)] ${expanded ? 'h-[80vh] w-[480px]' : 'h-[620px] w-[380px]'}`}
        >
          <div className="flex items-center justify-between border-b border-wefin-line bg-gradient-to-r from-wefin-mint-soft/40 to-transparent px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-wefin-mint shadow-sm">
                <WefinLogoIcon size={18} className="text-white" />
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <span className="text-sm font-bold text-wefin-text">위피니 AI</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-surface-2 hover:text-wefin-text"
                aria-label={expanded ? '채팅창 축소' : '채팅창 확대'}
              >
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-surface-2 hover:text-wefin-text"
                aria-label="위피니 채팅 닫기"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex-1 space-y-3 overflow-y-auto bg-wefin-surface p-3 scrollbar-thin"
          >
            {!hasAccessToken ? (
              <div className="mt-10 rounded-xl bg-wefin-bg px-4 py-5 text-center text-sm text-wefin-subtle">
                로그인 후 사용할 수 있어요
              </div>
            ) : isLoading && messages.length === 0 && pendingStatus === 'idle' ? (
              <div className="mt-10 text-center text-sm text-wefin-subtle">
                대화를 불러오는 중...
              </div>
            ) : (
              <div
                className="space-y-2"
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
                aria-atomic="false"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wefin-mint-soft">
                      <WefinLogoIcon size={24} className="text-wefin-mint-deep" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-wefin-text">무엇이든 물어보세요</p>
                      <p className="mt-1 text-xs text-wefin-subtle">
                        종목 전망, 재무 지표, 시장 흐름 등
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((chatMessage, index) => {
                  const isMine = chatMessage.userId === userId && chatMessage.role === 'USER'

                  return (
                    <div
                      key={getMessageKey(chatMessage, index)}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      {!isMine && (
                        <div className="mb-1 flex items-center gap-1">
                          <WefinLogoIcon size={12} className="text-wefin-mint" />
                          <span className="text-xs font-bold text-wefin-mint-deep">위피니</span>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed [overflow-wrap:anywhere] ${
                          isMine
                            ? 'rounded-tr-none bg-wefin-mint text-white'
                            : 'rounded-tl-none border border-wefin-line bg-wefin-surface text-wefin-text shadow-sm'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{chatMessage.content}</div>
                      </div>
                    </div>
                  )
                })}

                {pendingLabel && (
                  <div className="flex flex-col items-start" role="status" aria-live="polite">
                    <div className="mb-1 flex items-center gap-1">
                      <WefinLogoIcon size={12} className="text-wefin-mint" />
                      <span className="text-xs font-bold text-wefin-mint-deep">위피니</span>
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-none border border-wefin-line bg-wefin-surface px-3 py-2 text-sm leading-relaxed text-wefin-text shadow-sm">
                      <div className="flex items-center gap-2">
                        <span>{pendingLabel}</span>
                        <span className="flex items-center gap-1 text-wefin-mint">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-wefin-line bg-wefin-surface p-3">
            {errorMessage && (
              <div
                className="mb-2 rounded-lg border border-wefin-line bg-wefin-amber-soft px-3 py-2 text-xs text-wefin-amber-text"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <div className="flex items-center gap-2 rounded-full bg-wefin-surface-2 py-1.5 pr-1.5 pl-4">
              <input
                ref={inputRef}
                type="text"
                aria-label="위피니 채팅 메시지 입력"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing) {
                    return
                  }

                  if (event.key === 'Enter') {
                    void handleSendMessage()
                  }
                }}
                placeholder={hasAccessToken ? '삼성전자 전망 알려줘' : '로그인 후 이용할 수 있어요'}
                disabled={!hasAccessToken || isLoading || isSending || pendingStatus !== 'idle'}
                className="h-9 flex-1 border-none bg-transparent text-sm text-wefin-text focus:outline-none placeholder:text-wefin-subtle disabled:cursor-not-allowed disabled:text-wefin-subtle"
              />
              <button
                type="button"
                onClick={() => {
                  void handleSendMessage()
                }}
                disabled={
                  !message.trim() ||
                  !hasAccessToken ||
                  isLoading ||
                  isSending ||
                  pendingStatus !== 'idle'
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wefin-mint text-white transition-colors hover:bg-wefin-mint-deep disabled:opacity-40"
                aria-label="위피니 채팅 전송"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
