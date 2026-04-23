import type { ChatType } from '@/features/chat/model/chat-unread-types'

const CHAT_CLEAR_STORAGE_PREFIX = 'wefin:chat-clear-before:v1'

function getStorageKey(userId: string, chatType: ChatType, roomId?: number | null) {
  return [CHAT_CLEAR_STORAGE_PREFIX, userId, chatType, roomId ?? 'default'].join(':')
}

export function getChatClearBeforeMessageId(
  userId: string,
  chatType: ChatType,
  roomId?: number | null
) {
  if (typeof window === 'undefined' || !userId) {
    return null
  }

  try {
    const stored = window.localStorage.getItem(getStorageKey(userId, chatType, roomId))
    const parsed = stored == null ? Number.NaN : Number(stored)

    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function setChatClearBeforeMessageId(
  userId: string,
  chatType: ChatType,
  messageId: number,
  roomId?: number | null
) {
  if (typeof window === 'undefined' || !userId) {
    return
  }

  try {
    window.localStorage.setItem(getStorageKey(userId, chatType, roomId), String(messageId))
  } catch {
    // localStorage를 사용할 수 없는 환경에서는 현재 세션 상태만 유지한다.
  }
}

export function removeChatClearBeforeMessageId(
  userId: string,
  chatType: ChatType,
  roomId?: number | null
) {
  if (typeof window === 'undefined' || !userId) {
    return
  }

  try {
    window.localStorage.removeItem(getStorageKey(userId, chatType, roomId))
  } catch {
    // localStorage 접근 실패는 채팅 사용 자체를 막지 않는다.
  }
}
