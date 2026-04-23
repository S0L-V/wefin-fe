import { create } from 'zustand'

import type { ChatUnread } from '@/features/chat/api/chat-unread'
import type { ChatType } from '@/features/chat/model/chat-unread-types'

type ChatUnreadState = ChatUnread & {
  isChatPanelOpen: boolean
  activeChatType: ChatType | null
  visibleGlobalUnreadLine: boolean
  visibleGroupUnreadLine: boolean
  visibleGlobalReadMessageId: number | null
  visibleGroupReadMessageId: number | null
  setUnread: (payload: ChatUnread) => void
  applyUnreadDelta: (chatType: ChatType, delta?: number) => void
  setChatPanelState: (isOpen: boolean, activeChatType: ChatType | null) => void
  markChatReadLocally: (chatType: ChatType) => void
  dismissUnreadLine: (chatType: ChatType) => void
  snapshotUnreadLine: (chatType: ChatType) => void
  reset: () => void
}

const INITIAL_UNREAD = {
  globalUnreadCount: 0,
  groupUnreadCount: 0,
  totalUnreadCount: 0,
  hasGlobalUnread: false,
  hasGroupUnread: false,
  lastReadGlobalMessageId: null,
  lastReadGroupMessageId: null
} satisfies ChatUnread

function toUnreadState(payload: ChatUnread) {
  return {
    globalUnreadCount: payload.globalUnreadCount,
    groupUnreadCount: payload.groupUnreadCount,
    totalUnreadCount: payload.totalUnreadCount,
    hasGlobalUnread: payload.hasGlobalUnread,
    hasGroupUnread: payload.hasGroupUnread,
    lastReadGlobalMessageId: payload.lastReadGlobalMessageId,
    lastReadGroupMessageId: payload.lastReadGroupMessageId
  }
}

export const useChatUnreadStore = create<ChatUnreadState>((set) => ({
  ...INITIAL_UNREAD,
  isChatPanelOpen: false,
  activeChatType: null,
  visibleGlobalUnreadLine: false,
  visibleGroupUnreadLine: false,
  visibleGlobalReadMessageId: null,
  visibleGroupReadMessageId: null,
  setUnread: (payload) => set(toUnreadState(payload)),
  applyUnreadDelta: (chatType, delta = 1) =>
    set((state) => {
      if (chatType === 'GLOBAL') {
        const globalUnreadCount = Math.max(0, state.globalUnreadCount + delta)
        return {
          globalUnreadCount,
          totalUnreadCount: globalUnreadCount + state.groupUnreadCount,
          hasGlobalUnread: globalUnreadCount > 0,
          hasGroupUnread: state.groupUnreadCount > 0
        }
      }

      const groupUnreadCount = Math.max(0, state.groupUnreadCount + delta)
      return {
        groupUnreadCount,
        totalUnreadCount: state.globalUnreadCount + groupUnreadCount,
        hasGlobalUnread: state.globalUnreadCount > 0,
        hasGroupUnread: groupUnreadCount > 0
      }
    }),
  setChatPanelState: (isChatPanelOpen, activeChatType) =>
    set({
      isChatPanelOpen,
      activeChatType
    }),
  markChatReadLocally: (chatType) =>
    set((state) => {
      if (chatType === 'GLOBAL') {
        const totalUnreadCount = state.groupUnreadCount
        return {
          globalUnreadCount: 0,
          groupUnreadCount: state.groupUnreadCount,
          totalUnreadCount,
          hasGlobalUnread: false,
          hasGroupUnread: state.groupUnreadCount > 0
        }
      }

      const totalUnreadCount = state.globalUnreadCount
      return {
        globalUnreadCount: state.globalUnreadCount,
        groupUnreadCount: 0,
        totalUnreadCount,
        hasGlobalUnread: state.globalUnreadCount > 0,
        hasGroupUnread: false
      }
    }),
  dismissUnreadLine: (chatType) =>
    set(
      chatType === 'GLOBAL'
        ? {
            visibleGlobalUnreadLine: false,
            visibleGlobalReadMessageId: null
          }
        : {
            visibleGroupUnreadLine: false,
            visibleGroupReadMessageId: null
          }
    ),
  snapshotUnreadLine: (chatType) =>
    set((state) => {
      if (chatType === 'GLOBAL') {
        if (state.globalUnreadCount <= 0) {
          return {
            visibleGlobalUnreadLine: false,
            visibleGlobalReadMessageId: null
          }
        }

        return {
          visibleGlobalUnreadLine: true,
          visibleGlobalReadMessageId: state.lastReadGlobalMessageId
        }
      }

      if (state.groupUnreadCount <= 0) {
        return {
          visibleGroupUnreadLine: false,
          visibleGroupReadMessageId: null
        }
      }

      return {
        visibleGroupUnreadLine: true,
        visibleGroupReadMessageId: state.lastReadGroupMessageId
      }
    }),
  reset: () =>
    set({
      ...INITIAL_UNREAD,
      isChatPanelOpen: false,
      activeChatType: null,
      visibleGlobalUnreadLine: false,
      visibleGroupUnreadLine: false,
      visibleGlobalReadMessageId: null,
      visibleGroupReadMessageId: null
    })
}))
