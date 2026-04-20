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
      // 초기 히스토리 요청이 늦게 끝나도, 먼저 들어온 실시간 메시지를 덮어쓰지 않도록 병합한다.
      messages: mergeMessages(state.messages, page.messages),
      nextCursor: page.nextCursor,
      hasNext: page.hasNext
    })),
  appendMessage: (message) =>
    set((state) => {
      // STOMP 재연결이나 중복 구독 상황에서도 같은 메시지가 여러 번 쌓이지 않도록 막는다.
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
    const userId = get().userId
    const trimmedContent = content.trim()

    if (!client?.connected || !trimmedContent || !userId) {
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
      // 현재 가장 오래된 메시지 이전 구간을 이어 붙여 과거 히스토리를 확장한다.
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
