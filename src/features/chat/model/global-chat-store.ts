import { Client } from '@stomp/stompjs'
import { create } from 'zustand'

import type { GlobalChatMessage } from '@/features/chat/api/fetch-global-chat-messages'

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
      // STOMP reconnect can replay the latest event, so we dedupe by message id.
      if (
        message.messageId != null &&
        state.messages.some((item) => item.messageId === message.messageId)
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
    if (!client?.connected) {
      return
    }

    client.publish({
      destination: '/app/chat/global/send',
      body: JSON.stringify({ content })
    })
  },
  resetConnectionState: () =>
    set({
      connected: false,
      client: null,
      bootstrapped: false
    })
}))
