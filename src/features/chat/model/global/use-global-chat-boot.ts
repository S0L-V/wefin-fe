import { Client } from '@stomp/stompjs'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  type ChatUnreadNotification,
  chatUnreadSchema,
  fetchChatUnread,
  markGlobalChatRead
} from '@/features/chat/api/chat-unread'
import {
  fetchGlobalChatMessages,
  type GlobalChatMessage,
  globalChatMessageSchema
} from '@/features/chat/api/global/fetch-global-chat-messages'
import { isChatToastEnabled } from '@/features/chat/model/chat-toast-preferences'
import { useChatUnreadStore } from '@/features/chat/model/chat-unread-store'
import { useGlobalChatStore } from '@/features/chat/model/global/global-chat-store'
import { showChatBrowserNotification } from '@/features/chat/model/use-chat-unread-boot'
import { showChatInAppToast } from '@/features/chat/ui/chat-notification-toast'
import {
  connectStomp,
  disconnectStomp,
  onStompConnect,
  stompClient
} from '@/shared/api/stomp-client'

type ChatErrorMessage = {
  code: string
  message: string
  remainingSeconds?: number
}

const FALLBACK_ERROR_TIMEOUT_MS = 3000

function getAccessToken(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem('accessToken') ?? ''
}

function toGlobalUnreadNotification(message: GlobalChatMessage): ChatUnreadNotification | null {
  if (message.messageId == null) {
    return null
  }

  const unreadState = useChatUnreadStore.getState()

  const parsedUnreadState = chatUnreadSchema.safeParse({
    globalUnreadCount: unreadState.globalUnreadCount,
    groupUnreadCount: unreadState.groupUnreadCount,
    totalUnreadCount: unreadState.totalUnreadCount,
    hasGlobalUnread: unreadState.hasGlobalUnread,
    hasGroupUnread: unreadState.hasGroupUnread,
    lastReadGlobalMessageId: unreadState.lastReadGlobalMessageId,
    lastReadGroupMessageId: unreadState.lastReadGroupMessageId
  })

  if (!parsedUnreadState.success) {
    return null
  }

  return {
    chatType: 'GLOBAL',
    messageId: message.messageId,
    groupId: null,
    sender: message.sender ?? '알 수 없음',
    content: message.content,
    ...parsedUnreadState.data
  }
}

export function useGlobalChatBoot(userId: string) {
  const setUserId = useGlobalChatStore((state) => state.setUserId)
  const setInitialPage = useGlobalChatStore((state) => state.setInitialPage)
  const appendMessage = useGlobalChatStore((state) => state.appendMessage)
  const setConnected = useGlobalChatStore((state) => state.setConnected)
  const setLoading = useGlobalChatStore((state) => state.setLoading)
  const setErrorMessage = useGlobalChatStore((state) => state.setErrorMessage)
  const setClient = useGlobalChatStore((state) => state.setClient)
  const resetConnectionState = useGlobalChatStore((state) => state.resetConnectionState)

  const [accessToken, setAccessToken] = useState(() => getAccessToken())
  const hasBootstrappedRef = useRef(false)
  const subscriptionsRef = useRef<{ unsubscribe: () => void }[]>([])
  const errorTimeoutRef = useRef<number | null>(null)
  const readSyncRef = useRef({ inFlight: false, pending: false })

  useEffect(() => {
    setUserId(userId)
  }, [setUserId, userId])

  useEffect(() => {
    const syncAccessToken = () => {
      setAccessToken(getAccessToken())
    }

    window.addEventListener('auth-changed', syncAccessToken)
    window.addEventListener('storage', syncAccessToken)

    return () => {
      window.removeEventListener('auth-changed', syncAccessToken)
      window.removeEventListener('storage', syncAccessToken)
    }
  }, [])

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true

    // AppLayout은 라우트 전환 중에도 유지되므로 글로벌 채팅 연결과 초기 히스토리를 여기서 함께 관리한다.
    setLoading(true)
    setErrorMessage(null)

    let active = true

    fetchGlobalChatMessages()
      .then((page) => {
        if (!active) return
        setInitialPage(page)
        setLoading(false)
      })
      .catch((error) => {
        if (!active) return
        console.error('Failed to load global chat history:', error)
        setErrorMessage('전체 채팅 이력을 불러오지 못했습니다.')
        setLoading(false)
      })

    const client = stompClient as Client

    const syncGlobalChatRead = () => {
      const syncState = readSyncRef.current

      if (syncState.inFlight) {
        syncState.pending = true
        return
      }

      syncState.inFlight = true

      void markGlobalChatRead()
        .then(() => fetchChatUnread())
        .then((payload) => {
          useChatUnreadStore.getState().setUnread(payload)
        })
        .catch((error) => {
          console.error('Failed to mark global chat as read from realtime event:', error)
        })
        .finally(() => {
          syncState.inFlight = false

          if (syncState.pending) {
            syncState.pending = false
            syncGlobalChatRead()
          }
        })
    }

    // 토큰이 있으면 인증 연결, 없으면 익명으로 글로벌 채팅만 구독한다.
    client.connectHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

    client.debug = () => {}

    // onStompConnect 리스너로 등록 — client.onConnect를 덮어쓰지 않아
    // 다른 훅(투표, 턴 전환 등)의 구독이 파괴되지 않는다.
    const removeConnectListener = onStompConnect(() => {
      setConnected(true)

      subscriptionsRef.current.forEach((subscription) => subscription.unsubscribe())
      subscriptionsRef.current = []

      subscriptionsRef.current.push(
        client.subscribe('/topic/chat/global', (frame) => {
          try {
            const parsed = globalChatMessageSchema.safeParse(JSON.parse(frame.body))
            if (!parsed.success) {
              console.error('전체 채팅 메시지 파싱 실패')
              return
            }

            appendMessage(parsed.data)

            if (!userId || parsed.data.userId === userId) {
              return
            }

            const unreadState = useChatUnreadStore.getState()
            const isViewingGlobalChat =
              unreadState.isChatPanelOpen &&
              unreadState.activeChatType === 'GLOBAL' &&
              document.visibilityState === 'visible'

            if (isViewingGlobalChat) {
              unreadState.markChatReadLocally('GLOBAL')
              syncGlobalChatRead()
              return
            }

            unreadState.applyUnreadDelta('GLOBAL')
            const notificationPayload = toGlobalUnreadNotification(parsed.data)

            if (!notificationPayload) {
              return
            }

            const shouldShowInAppNotification =
              !document.hidden &&
              document.visibilityState === 'visible' &&
              isChatToastEnabled(userId, 'GLOBAL')

            if (shouldShowInAppNotification) {
              showChatInAppToast(notificationPayload)
            }

            if (document.hidden) {
              void showChatBrowserNotification(notificationPayload, null)
            }
          } catch {
            console.error('전체 채팅 메시지 처리 실패')
          }
        })
      )

      if (userId) {
        subscriptionsRef.current.push(
          client.subscribe('/user/queue/errors', (frame) => {
            try {
              const error = JSON.parse(frame.body) as ChatErrorMessage
              const timeoutMs = (error.remainingSeconds ?? 3) * 1000

              toast.warning(error.message, {
                duration: Math.max(timeoutMs, FALLBACK_ERROR_TIMEOUT_MS)
              })
            } catch {
              console.error('전체 채팅 에러 메시지 파싱 실패')
            }
          })
        )
      }
    })

    client.onDisconnect = () => {
      setConnected(false)
    }

    client.onStompError = (frame) => {
      console.error('Broker error:', frame.headers['message'])
      console.error('Details:', frame.body)
    }

    client.onWebSocketError = (event) => {
      console.error('WebSocket error:', event)
    }

    setClient(client)
    connectStomp()

    return () => {
      active = false
      removeConnectListener()
      subscriptionsRef.current.forEach((subscription) => subscription.unsubscribe())
      subscriptionsRef.current = []

      if (errorTimeoutRef.current != null) {
        window.clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = null
      }

      disconnectStomp()
      resetConnectionState()
      hasBootstrappedRef.current = false
    }
  }, [
    accessToken,
    appendMessage,
    resetConnectionState,
    setClient,
    setConnected,
    setErrorMessage,
    setInitialPage,
    setLoading,
    userId
  ])
}
