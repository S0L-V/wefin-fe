import { Client } from '@stomp/stompjs'
import { useEffect, useRef, useState } from 'react'

import {
  fetchGlobalChatMessages,
  globalChatMessageSchema
} from '@/features/chat/api/global/fetch-global-chat-messages'
import { useGlobalChatStore } from '@/features/chat/model/global/global-chat-store'
import { connectStomp, disconnectStomp, stompClient } from '@/shared/api/stomp-client'

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
    if (!userId || !accessToken || hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true

    // AppLayout�� ���Ʈ ��ȯ �߿��� �����ǹǷ� �۷ι� ä�� ����� �ʱ� �����丮�� ���⼭ �Բ� �����Ѵ�.
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
        setErrorMessage('��ü ä�� �̷��� �ҷ����� ���߽��ϴ�.')
        setLoading(false)
      })

    const client = stompClient as Client

    // ��ū�� ���ŵǸ� effect�� �ٽ� ���鼭 �ֽ� access token���� CONNECT ����� ��ü�Ѵ�.
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
              console.error('��ü ä�� �޽��� �Ľ� ����')
              return
            }

            appendMessage(parsed.data)
          } catch {
            console.error('��ü ä�� �޽��� ó�� ����')
          }
        })
      )

      subscriptionsRef.current.push(
        client.subscribe('/user/queue/errors', (frame) => {
          try {
            const error = JSON.parse(frame.body) as ChatErrorMessage
            const timeoutMs = (error.remainingSeconds ?? 3) * 1000

            // ���� ������ ���� ���д� ä�� ȭ���� ������ �ʰ� ��ʷθ� ������ �� �ڵ����� �����.
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
            console.error('��ü ä�� ���� �޽��� �Ľ� ����')
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
