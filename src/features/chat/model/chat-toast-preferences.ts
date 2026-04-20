import { useEffect, useState } from 'react'

import type { ChatType } from '@/features/chat/model/chat-unread-types'

type ChatToastPreferences = {
  globalEnabled: boolean
  groupEnabled: boolean
}

const DEFAULT_CHAT_TOAST_PREFERENCES: ChatToastPreferences = {
  globalEnabled: true,
  groupEnabled: true
}

const CHAT_TOAST_PREFERENCES_EVENT = 'chat-toast-preferences-changed'

function getChatToastPreferencesKey(userId: string) {
  return `wefin.chat-toast-preferences.${userId}`
}

export function getChatToastPreferences(userId: string): ChatToastPreferences {
  if (typeof window === 'undefined' || !userId) {
    return DEFAULT_CHAT_TOAST_PREFERENCES
  }

  const stored = window.localStorage.getItem(getChatToastPreferencesKey(userId))

  if (!stored) {
    return DEFAULT_CHAT_TOAST_PREFERENCES
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ChatToastPreferences>

    return {
      globalEnabled: parsed.globalEnabled ?? DEFAULT_CHAT_TOAST_PREFERENCES.globalEnabled,
      groupEnabled: parsed.groupEnabled ?? DEFAULT_CHAT_TOAST_PREFERENCES.groupEnabled
    }
  } catch {
    return DEFAULT_CHAT_TOAST_PREFERENCES
  }
}

export function isChatToastEnabled(userId: string, chatType: ChatType) {
  const preferences = getChatToastPreferences(userId)

  return chatType === 'GLOBAL' ? preferences.globalEnabled : preferences.groupEnabled
}

export function updateChatToastPreference(userId: string, chatType: ChatType, enabled: boolean) {
  if (typeof window === 'undefined' || !userId) {
    return DEFAULT_CHAT_TOAST_PREFERENCES
  }

  const nextPreferences = {
    ...getChatToastPreferences(userId),
    ...(chatType === 'GLOBAL' ? { globalEnabled: enabled } : { groupEnabled: enabled })
  }

  window.localStorage.setItem(getChatToastPreferencesKey(userId), JSON.stringify(nextPreferences))
  window.dispatchEvent(
    new CustomEvent<ChatToastPreferences>(CHAT_TOAST_PREFERENCES_EVENT, {
      detail: nextPreferences
    })
  )

  return nextPreferences
}

export function useChatToastPreferences(userId: string) {
  const [preferences, setPreferences] = useState<ChatToastPreferences>(() =>
    getChatToastPreferences(userId)
  )

  useEffect(() => {
    setPreferences(getChatToastPreferences(userId))
  }, [userId])

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) {
      return
    }

    const syncPreferences = () => {
      setPreferences(getChatToastPreferences(userId))
    }

    window.addEventListener(CHAT_TOAST_PREFERENCES_EVENT, syncPreferences)
    window.addEventListener('storage', syncPreferences)

    return () => {
      window.removeEventListener(CHAT_TOAST_PREFERENCES_EVENT, syncPreferences)
      window.removeEventListener('storage', syncPreferences)
    }
  }, [userId])

  return preferences
}
