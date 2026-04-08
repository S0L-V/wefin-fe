import { Client } from '@stomp/stompjs'
import { useEffect, useRef } from 'react'

import {
  fetchGlobalChatMessages,
  globalChatMessageSchema
} from '@/features/chat/api/fetch-global-chat-messages'
import { useGlobalChatStore } from '@/features/chat/model/global-chat-store'
import { connectStomp, disconnectStomp, stompClient } from '@/shared/api/stomp-client'

type ChatErrorMessage = {
  code: string
  message: string
  remainingSeconds?: number
}

const FALLBACK_ERROR_TIMEOUT_MS = 3000

export function useGlobalChatBoot(userId: string) {
  const setUserId = useGlobalChatStore((state) => state.setUserId)
  const setInitialPage = useGlobalChatStore((state) => state.setInitialPage)
  const appendMessage = useGlobalChatStore((state) => state.appendMessage)
  const setConnected = useGlobalChatStore((state) => state.setConnected)
  const setLoading = useGlobalChatStore((state) => state.setLoading)
  const setErrorMessage = useGlobalChatStore((state) => state.setErrorMessage)
  const setClient = useGlobalChatStore((state) => state.setClient)
  const resetConnectionState = useGlobalChatStore((state) => state.resetConnectionState)

  const hasBootstrappedRef = useRef(false)
  const subscriptionsRef = useRef<{ unsubscribe: () => void }[]>([])
  const errorTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setUserId(userId)
  }, [setUserId, userId])

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')

    if (!userId || !accessToken || hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true

    // AppLayout은 라우트 전환 중에도 계속 마운트되므로,
    // 여기서 한 번만 연결해서 전역 채팅 연결과 상태를 재사용한다.
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
        setErrorMessage('전체 채팅 내역을 불러오지 못했습니다.')
        setLoading(false)
      })

    const client = stompClient as Client

    // 웹소켓 CONNECT 시에도 REST와 동일한 access token을 보내서 로그인 사용자를 식별한다.
    client.connectHeaders = {
      Authorization: `Bearer ${accessToken}`
    }

    client.debug = (message) => {
      console.log('[STOMP]', message)
    }

    client.onConnect = () => {
      setConnected(true)

      subscriptionsRef.current.forEach((subscription) => subscription.unsubscribe())
      subscriptionsRef.current = []

      subscriptionsRef.current.push(
        client.subscribe('/topic/chat/global', (frame) => {
          try {
            const parsed = globalChatMessageSchema.safeParse(JSON.parse(frame.body))
            if (!parsed.success) {
              console.error('전역 채팅 메시지 파싱 실패')
              return
            }

            appendMessage(parsed.data)
          } catch {
            console.error('전역 채팅 메시지 처리 실패')
          }
        })
      )

      subscriptionsRef.current.push(
        client.subscribe('/user/queue/errors', (frame) => {
          try {
            const error = JSON.parse(frame.body) as ChatErrorMessage
            const timeoutMs = (error.remainingSeconds ?? 3) * 1000

            // 도배 감지 등 사용자별 오류는 화면 배너로만 보여주고,
            // 일정 시간이 지나면 자동으로 지워서 채팅 흐름을 방해하지 않게 한다.
            setErrorMessage(error.message)

            if (errorTimeoutRef.current != null) {
              window.clearTimeout(errorTimeoutRef.current)
            }

            errorTimeoutRef.current = window.setTimeout(
              () => {
                setErrorMessage(null)
                errorTimeoutRef.current = null
              },
              Math.max(timeoutMs, FALLBACK_ERROR_TIMEOUT_MS)
            )
          } catch {
            console.error('전역 채팅 에러 메시지 파싱 실패')
          }
        })
      )
    }

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
