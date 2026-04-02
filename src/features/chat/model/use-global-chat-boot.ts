import { Client } from '@stomp/stompjs'
import { useEffect, useRef } from 'react'
import SockJS from 'sockjs-client'

import { fetchGlobalChatMessages } from '@/features/chat/api/fetch-global-chat-messages'
import { useGlobalChatStore } from '@/features/chat/model/global-chat-store'

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

  useEffect(() => {
    setUserId(userId)
  }, [setUserId, userId])

  useEffect(() => {
    if (!userId || hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true

    // AppLayout stays mounted while page routes switch,
    // so we connect here once and share the same chat state.
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

    // SockJS opens the physical websocket connection.
    // STOMP adds topic subscription/publish on top of that socket.
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

        // Global chat messages are broadcast by the backend to this topic.
        client.subscribe('/topic/chat/global', (frame) => {
          appendMessage(JSON.parse(frame.body))
        })

        // Per-user websocket errors come through this queue.
        client.subscribe('/user/queue/errors', (frame) => {
          const error = JSON.parse(frame.body) as ChatErrorMessage
          window.alert(error.message)
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

    setClient(client)
    client.activate()

    return () => {
      active = false
      client.deactivate()
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
