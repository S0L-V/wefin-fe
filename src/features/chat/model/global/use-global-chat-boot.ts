import { Client } from '@stomp/stompjs'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  fetchGlobalChatMessages,
  globalChatMessageSchema
} from '@/features/chat/api/global/fetch-global-chat-messages'
import { useGlobalChatStore } from '@/features/chat/model/global/global-chat-store'
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

    // 토큰이 있으면 인증 연결, 없으면 익명으로 글로벌 채팅만 구독한다.
    client.connectHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

    client.debug = (message) => {
      console.log('[STOMP]', message)
    }

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
