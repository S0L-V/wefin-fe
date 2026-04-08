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
  sessionVersion: number
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
  loadOlderMessages: () => Promise<boolean>
  resetConnectionState: () => void
}

function isSameMessage(left: GlobalChatMessage, right: GlobalChatMessage): boolean {
  if (left.messageId != null && right.messageId != null) {
    return left.messageId === right.messageId
  }

  return (
    left.messageId == null &&
    right.messageId == null &&
    left.role === right.role &&
    left.userId === right.userId &&
    left.sender === right.sender &&
    left.content === right.content &&
    left.createdAt === right.createdAt
  )
}

function mergeMessages(
  currentMessages: GlobalChatMessage[],
  incomingMessages: GlobalChatMessage[]
): GlobalChatMessage[] {
  const mergedMessages = [...incomingMessages]

  currentMessages.forEach((message) => {
    if (mergedMessages.some((item) => isSameMessage(item, message))) {
      return
    }

    mergedMessages.push(message)
  })

  return mergedMessages
}

export const useGlobalChatStore = create<GlobalChatState>((set, get) => ({
  userId: '',
  messages: [],
  nextCursor: null,
  hasNext: false,
  sessionVersion: 0,
  connected: false,
  loading: false,
  loadingOlder: false,
  errorMessage: null,
  client: null,
  bootstrapped: false,
  setUserId: (userId) => set({ userId }),
  setInitialPage: (page) =>
    set((state) => ({
      // �ʱ� �����丮 ��û�� �ʰ� ������, ���� ���� �ǽð� �޽����� ����� �ʵ��� �����Ѵ�.
      messages: mergeMessages(state.messages, page.messages),
      nextCursor: page.nextCursor,
      hasNext: page.hasNext
    })),
  appendMessage: (message) =>
    set((state) => {
      // STOMP �翬���̳� �ߺ� ���� ��Ȳ������ ���� �޽����� ���� �� ������ �ʵ��� ���´�.
      if (state.messages.some((item) => isSameMessage(item, message))) {
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
    const { nextCursor, hasNext, loadingOlder, sessionVersion } = get()

    if (!hasNext || nextCursor == null || loadingOlder) {
      return false
    }

    set({ loadingOlder: true })

    try {
      // ���� ���� ������ �޽��� ���� ������ �̾� �ٿ��� ���� �����丮�� Ȯ���Ѵ�.
      const page = await fetchGlobalChatMessages(nextCursor)

      if (get().sessionVersion !== sessionVersion) {
        return false
      }

      set((state) => ({
        messages: mergeMessages(state.messages, page.messages),
        nextCursor: page.nextCursor,
        hasNext: page.hasNext,
        loadingOlder: false
      }))
      return true
    } catch (error) {
      console.error('Failed to load older global chat messages:', error)

      if (get().sessionVersion === sessionVersion) {
        set({ loadingOlder: false })
      }

      return false
    }
  },
  resetConnectionState: () =>
    set({
      messages: [],
      connected: false,
      client: null,
      bootstrapped: false,
      nextCursor: null,
      hasNext: false,
      loadingOlder: false,
      sessionVersion: get().sessionVersion + 1
    })
}))
