import { Client } from '@stomp/stompjs'
import { create } from 'zustand'

import type { GroupChatMessage } from '@/features/chat/api/group/fetch-group-chat-messages'
import type { GroupChatMeta } from '@/features/chat/api/group/fetch-group-chat-meta'

type GroupChatState = {
  userId: string
  groupMeta: GroupChatMeta | null
  messages: GroupChatMessage[]
  connected: boolean
  loading: boolean
  errorMessage: string | null
  replyTarget: GroupChatMessage | null
  setUserId: (userId: string) => void
  setGroupMeta: (groupMeta: GroupChatMeta | null) => void
  setMessages: (messages: GroupChatMessage[]) => void
  appendMessage: (message: GroupChatMessage) => void
  setConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
  setErrorMessage: (errorMessage: string | null) => void
  setReplyTarget: (message: GroupChatMessage | null) => void
  clearReplyTarget: () => void
  sendMessage: (client: Client | null, content: string) => boolean
}

export const useGroupChatStore = create<GroupChatState>((set, get) => ({
  userId: '',
  groupMeta: null,
  messages: [],
  connected: false,
  loading: false,
  errorMessage: null,
  replyTarget: null,
  setUserId: (userId) => set({ userId }),
  setGroupMeta: (groupMeta) => set({ groupMeta }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) =>
    set((state) => {
      if (state.messages.some((item) => item.messageId === message.messageId)) {
        return state
      }

      return { messages: [...state.messages, message] }
    }),
  setConnected: (connected) => set({ connected }),
  setLoading: (loading) => set({ loading }),
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
  }
}))
