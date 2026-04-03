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

export function useGlobalChatBoot(userId: string) {
  const setUserId = useGlobalChatStore((state) => state.setUserId)
  const setMessages = useGlobalChatStore((state) => state.setMessages)
  const appendMessage = useGlobalChatStore((state) => state.appendMessage)
  const setConnected = useGlobalChatStore((state) => state.setConnected)
  const setLoading = useGlobalChatStore((state) => state.setLoading)
  const setErrorMessage = useGlobalChatStore((state) => state.setErrorMessage)
  const setClient = useGlobalChatStore((state) => state.setClient)
  const resetConnectionState = useGlobalChatStore((state) => state.resetConnectionState)

  const hasBootstrappedRef = useRef(false)
  const subscriptionsRef = useRef<{ unsubscribe: () => void }[]>([])

  useEffect(() => {
    setUserId(userId)
  }, [setUserId, userId])

  useEffect(() => {
    if (!userId || hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true

    // AppLayout은 라우트 전환 중에도 계속 마운트되어 있으므로
    // 여기서 한 번만 연결해서 같은 채팅 상태를 공유
    setLoading(true)
    setErrorMessage(null)

    let active = true

    fetchGlobalChatMessages()
      .then((messages) => {
        if (!active) return
        setMessages(messages)
        setLoading(false)
      })
      .catch((error) => {
        if (!active) return
        console.error('Failed to load global chat history:', error)
        setErrorMessage('Failed to load global chat history.')
        setLoading(false)
      })

    const client = stompClient as Client

    client.connectHeaders = {
      ...client.connectHeaders,
      userId
    }

    client.debug = (message) => {
      console.log('[STOMP]', message)
    }

    client.onConnect = () => {
      setConnected(true)
      setErrorMessage(null)

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
            setErrorMessage(error.message)
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
    setLoading,
    setMessages,
    userId
  ])
}
