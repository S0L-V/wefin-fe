import { Client } from '@stomp/stompjs'
import { create } from 'zustand'

import {
  fetchGlobalChatMessages,
  type GlobalChatMessage,
  type GlobalChatMessagesPage
} from '@/features/chat/api/global/fetch-global-chat-messages'

type GlobalChatState = {
  userId: string
  messages: GlobalChatMessage[]
  nextCursor: number | null
  hasNext: boolean
  connected: boolean
  loading: boolean
  loadingOlder: boolean
  errorMessage: string | null
  client: Client | null
  bootstrapped: boolean
  setUserId: (userId: string) => void
  setInitialPage: (page: GlobalChatMessagesPage) => void
  appendMessage: (message: GlobalChatMessage) => void
  setConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
  setLoadingOlder: (loadingOlder: boolean) => void
  setErrorMessage: (errorMessage: string | null) => void
  setClient: (client: Client | null) => void
  setBootstrapped: (bootstrapped: boolean) => void
  sendMessage: (content: string) => void
  loadOlderMessages: () => Promise<void>
  resetConnectionState: () => void
}

function mergeOlderMessages(
  currentMessages: GlobalChatMessage[],
  olderMessages: GlobalChatMessage[]
): GlobalChatMessage[] {
  const existingIds = new Set(
    currentMessages
      .map((message) => message.messageId)
      .filter((messageId): messageId is number => messageId != null)
  )

  const filteredOlderMessages = olderMessages.filter((message) => {
    if (message.messageId == null) {
      return true
    }

    return !existingIds.has(message.messageId)
  })

  return [...filteredOlderMessages, ...currentMessages]
}

export const useGlobalChatStore = create<GlobalChatState>((set, get) => ({
  userId: '',
  messages: [],
  nextCursor: null,
  hasNext: false,
  connected: false,
  loading: false,
  loadingOlder: false,
  errorMessage: null,
  client: null,
  bootstrapped: false,
  setUserId: (userId) => set({ userId }),
  setInitialPage: (page) =>
    set({
      messages: page.messages,
      nextCursor: page.nextCursor,
      hasNext: page.hasNext
    }),
  appendMessage: (message) =>
    set((state) => {
      // STOMP 재연결 시 마지막 이벤트가 다시 들어올 수 있어서 messageId 기준으로 중복을 제거한다.
      if (
        message.messageId != null &&
        state.messages.some((item) => item.messageId === message.messageId)
      ) {
        return state
      }

      if (
        message.messageId == null &&
        state.messages.some(
          (item) =>
            item.messageId == null &&
            item.role === message.role &&
            item.userId === message.userId &&
            item.sender === message.sender &&
            item.content === message.content &&
            item.createdAt === message.createdAt
        )
      ) {
        return state
      }

      return { messages: [...state.messages, message] }
    }),
  setConnected: (connected) => set({ connected }),
  setLoading: (loading) => set({ loading }),
  setLoadingOlder: (loadingOlder) => set({ loadingOlder }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setClient: (client) => set({ client }),
  setBootstrapped: (bootstrapped) => set({ bootstrapped }),
  sendMessage: (content) => {
    const client = get().client
    const trimmedContent = content.trim()

    if (!client?.connected || !trimmedContent) {
      return
    }

    client.publish({
      destination: '/app/chat/global/send',
      body: JSON.stringify({ content: trimmedContent })
    })
  },
  loadOlderMessages: async () => {
    const { nextCursor, hasNext, loadingOlder } = get()

    if (!hasNext || nextCursor == null || loadingOlder) {
      return
    }

    set({ loadingOlder: true })

    try {
      // 현재 가장 오래된 메시지 이전 구간을 이어 붙여서 과거 히스토리를 확장한다.
      const page = await fetchGlobalChatMessages(nextCursor)

      set((state) => ({
        messages: mergeOlderMessages(state.messages, page.messages),
        nextCursor: page.nextCursor,
        hasNext: page.hasNext,
        loadingOlder: false
      }))
    } catch (error) {
      console.error('Failed to load older global chat messages:', error)
      set({ loadingOlder: false })
    }
  },
  resetConnectionState: () =>
    set({
      connected: false,
      client: null,
      bootstrapped: false,
      nextCursor: null,
      hasNext: false,
      loadingOlder: false
    })
}))
