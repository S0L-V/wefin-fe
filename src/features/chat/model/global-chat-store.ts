import { Client } from '@stomp/stompjs'
import { create } from 'zustand'

import type { GlobalChatMessage } from '@/features/chat/api/global/fetch-global-chat-messages'

type GlobalChatState = {
  userId: string
  messages: GlobalChatMessage[]
  connected: boolean
  loading: boolean
  errorMessage: string | null
  client: Client | null
  bootstrapped: boolean
  setUserId: (userId: string) => void
  setMessages: (messages: GlobalChatMessage[]) => void
  appendMessage: (message: GlobalChatMessage) => void
  setConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
  setErrorMessage: (errorMessage: string | null) => void
  setClient: (client: Client | null) => void
  setBootstrapped: (bootstrapped: boolean) => void
  sendMessage: (content: string) => void
  resetConnectionState: () => void
}

export const useGlobalChatStore = create<GlobalChatState>((set, get) => ({
  userId: '',
  messages: [],
  connected: false,
  loading: false,
  errorMessage: null,
  client: null,
  bootstrapped: false,
  setUserId: (userId) => set({ userId }),
  setMessages: (messages) => set({ messages }),
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
  resetConnectionState: () =>
    set({
      connected: false,
      client: null,
      bootstrapped: false
    })
}))
