import { Client } from '@stomp/stompjs'
import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'

import type { GlobalChatMessage } from '@/features/chat/api/fetch-global-chat-messages'

interface ChatErrorMessage {
  code: string
  message: string
  remainingSeconds?: number
}

interface UseGlobalChatSocketParams {
  userId: string
  onMessage: (message: GlobalChatMessage) => void
  onError?: (error: ChatErrorMessage) => void
}

export function useGlobalChatSocket({ userId, onMessage, onError }: UseGlobalChatSocketParams) {
  const [connected, setConnected] = useState(false)

  const clientRef = useRef<Client | null>(null)
  const onMessageRef = useRef(onMessage)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!userId) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        userId
      },
      reconnectDelay: 5000,
      debug: (message) => {
        console.log('[STOMP]', message)
      },
      onConnect: () => {
        setConnected(true)

        // 채팅 메시지 구독
        client.subscribe('/topic/chat/global', (frame) => {
          const body = JSON.parse(frame.body) as GlobalChatMessage
          onMessageRef.current(body)
        })

        // 사용자 전용 에러 구독
        client.subscribe('/user/queue/errors', (frame) => {
          const error = JSON.parse(frame.body) as ChatErrorMessage
          onErrorRef.current?.(error)
        })
      },
      onDisconnect: () => {
        setConnected(false)
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message'])
        console.error('Details:', frame.body)
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event)
      }
    })

    clientRef.current = client
    client.activate()

    return () => {
      setConnected(false)
      client.deactivate()
      clientRef.current = null
    }
  }, [userId])

  const sendMessage = (content: string) => {
    const client = clientRef.current
    if (!client?.connected) return

    client.publish({
      destination: '/app/chat/global/send',
      body: JSON.stringify({ content })
    })
  }

  return {
    connected,
    sendMessage
  }
}
