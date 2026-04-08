import { Client } from '@stomp/stompjs'
import { create } from 'zustand'

import {
  fetchGroupChatMessages,
  type GroupChatMessage,
  type GroupChatMessagesPage
} from '@/features/chat/api/group/fetch-group-chat-messages'
import type { GroupChatMeta } from '@/features/chat/api/group/fetch-group-chat-meta'

type GroupChatState = {
  userId: string
  groupMeta: GroupChatMeta | null
  messages: GroupChatMessage[]
  nextCursor: number | null
  hasNext: boolean
  sessionVersion: number
  connected: boolean
  loading: boolean
  loadingOlder: boolean
  errorMessage: string | null
  replyTarget: GroupChatMessage | null
  setUserId: (userId: string) => void
  setGroupMeta: (groupMeta: GroupChatMeta | null) => void
  setInitialPage: (page: GroupChatMessagesPage) => void
  appendMessage: (message: GroupChatMessage) => void
  setConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
  setLoadingOlder: (loadingOlder: boolean) => void
  setErrorMessage: (errorMessage: string | null) => void
  setReplyTarget: (message: GroupChatMessage | null) => void
  clearReplyTarget: () => void
  sendMessage: (client: Client | null, content: string) => boolean
  loadOlderMessages: () => Promise<boolean>
  resetSessionState: () => void
}

function isSameMessage(left: GroupChatMessage, right: GroupChatMessage): boolean {
  return left.messageId === right.messageId
}

function mergeMessages(
  currentMessages: GroupChatMessage[],
  incomingMessages: GroupChatMessage[]
): GroupChatMessage[] {
  const mergedMessages = [...incomingMessages]

  currentMessages.forEach((message) => {
    if (mergedMessages.some((item) => isSameMessage(item, message))) {
      return
    }

    mergedMessages.push(message)
  })

  return mergedMessages
}

export const useGroupChatStore = create<GroupChatState>((set, get) => ({
  userId: '',
  groupMeta: null,
  messages: [],
  nextCursor: null,
  hasNext: false,
  sessionVersion: 0,
  connected: false,
  loading: false,
  loadingOlder: false,
  errorMessage: null,
  replyTarget: null,
  setUserId: (userId) => set({ userId }),
  setGroupMeta: (groupMeta) => set({ groupMeta }),
  setInitialPage: (page) =>
    set((state) => ({
      // 초기 조회가 늦게 끝나도 먼저 반영된 실시간 메시지를 덮어쓰지 않도록 병합한다.
      messages: mergeMessages(state.messages, page.messages),
      nextCursor: page.nextCursor,
      hasNext: page.hasNext
    })),
  appendMessage: (message) =>
    set((state) => {
      if (state.messages.some((item) => isSameMessage(item, message))) {
        return state
      }

      return { messages: [...state.messages, message] }
    }),
  setConnected: (connected) => set({ connected }),
  setLoading: (loading) => set({ loading }),
  setLoadingOlder: (loadingOlder) => set({ loadingOlder }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setReplyTarget: (replyTarget) => set({ replyTarget }),
  clearReplyTarget: () => set({ replyTarget: null }),
  sendMessage: (client, content) => {
    const trimmedContent = content.trim()
    const replyTarget = get().replyTarget

    if (!client?.connected || !trimmedContent) {
      return false
    }

    client.publish({
      destination: '/app/chat/group/send',
      body: JSON.stringify({
        content: trimmedContent,
        replyToMessageId: replyTarget?.messageId ?? null
      })
    })

    set({ replyTarget: null })
    return true
  },
  loadOlderMessages: async () => {
    const { nextCursor, hasNext, loadingOlder, sessionVersion } = get()

    if (!hasNext || nextCursor == null || loadingOlder) {
      return false
    }

    set({ loadingOlder: true })

    try {
      // 그룹 채팅의 현재 최상단 이전 구간을 이어 붙여 과거 히스토리를 확장한다.
      const page = await fetchGroupChatMessages(nextCursor)

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
      console.error('Failed to load older group chat messages:', error)
      if (get().sessionVersion === sessionVersion) {
        set({ loadingOlder: false })
      }
      return false
    }
  },
  resetSessionState: () =>
    set((state) => ({
      groupMeta: null,
      messages: [],
      nextCursor: null,
      hasNext: false,
      connected: false,
      loading: false,
      loadingOlder: false,
      errorMessage: null,
      replyTarget: null,
      sessionVersion: state.sessionVersion + 1
    }))
}))
