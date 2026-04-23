import { useEffect, useRef } from 'react'

import {
  type ChatUnread,
  type ChatUnreadNotification,
  chatUnreadNotificationSchema,
  fetchChatUnread,
  markGlobalChatRead,
  markGroupChatRead
} from '@/features/chat/api/chat-unread'
import { isChatToastEnabled } from '@/features/chat/model/chat-toast-preferences'
import { useChatUnreadStore } from '@/features/chat/model/chat-unread-store'
import type { ChatType } from '@/features/chat/model/chat-unread-types'
import { showChatInAppToast } from '@/features/chat/ui/chat-notification-toast'
import { onStompConnect, stompClient } from '@/shared/api/stomp-client'

const DEFAULT_TITLE = 'Wefin'

function getBaseTitle() {
  if (typeof document === 'undefined') {
    return DEFAULT_TITLE
  }

  return document.title || DEFAULT_TITLE
}

function getFaviconElement() {
  let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']")

  if (!favicon) {
    favicon = document.createElement('link')
    favicon.rel = 'icon'
    document.head.appendChild(favicon)
  }

  return favicon
}

async function buildUnreadFavicon(baseHref: string, unreadCount: number): Promise<string> {
  if (typeof document === 'undefined') {
    return baseHref
  }

  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')

  if (!context) {
    return baseHref
  }

  context.clearRect(0, 0, 64, 64)

  try {
    const image = new Image()
    image.crossOrigin = 'anonymous'

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('favicon load failed'))
      image.src = baseHref
    })

    context.drawImage(image, 0, 0, 64, 64)
  } catch {
    context.fillStyle = '#24a8ab'
    context.beginPath()
    context.arc(32, 32, 28, 0, Math.PI * 2)
    context.fill()
  }

  context.fillStyle = '#ef4444'
  context.beginPath()
  context.arc(49, 15, 15, 0, Math.PI * 2)
  context.fill()

  const text = unreadCount > 99 ? '99+' : String(unreadCount)
  context.fillStyle = '#ffffff'
  context.font = unreadCount > 99 ? 'bold 12px sans-serif' : 'bold 16px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, 49, 15)

  return canvas.toDataURL('image/png')
}

async function ensureNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }

  if (window.Notification.permission === 'default') {
    try {
      return await window.Notification.requestPermission()
    } catch {
      return window.Notification.permission
    }
  }

  return window.Notification.permission
}

async function markChatRead(chatType: ChatType) {
  if (chatType === 'GLOBAL') {
    await markGlobalChatRead()
    return
  }

  await markGroupChatRead()
}

async function syncUnreadState() {
  return fetchChatUnread()
}

function toUnreadPayload(payload: ChatUnreadNotification): ChatUnread {
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

export async function showChatBrowserNotification(
  payload: ChatUnreadNotification,
  baseFaviconHref: string | null
) {
  const permission = await ensureNotificationPermission()

  if (permission !== 'granted' || typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  const title = payload.chatType === 'GROUP' ? '그룹 채팅' : '전체 채팅'
  const notification = new window.Notification(title, {
    body: `${payload.sender}: ${payload.content}`,
    icon: baseFaviconHref ?? '/favicon.ico',
    tag: `${payload.chatType}:${payload.messageId}`
  })

  notification.onclick = () => {
    window.focus()
  }
}

export function useChatUnreadBoot(userId: string) {
  const setUnread = useChatUnreadStore((state) => state.setUnread)
  const setChatPanelState = useChatUnreadStore((state) => state.setChatPanelState)
  const reset = useChatUnreadStore((state) => state.reset)
  const totalUnreadCount = useChatUnreadStore((state) => state.totalUnreadCount)

  const baseTitleRef = useRef(getBaseTitle())
  const baseFaviconRef = useRef<string | null>(null)
  const faviconJobRef = useRef(0)
  const readSyncRef = useRef<Record<ChatType, { inFlight: boolean; pending: boolean }>>({
    GLOBAL: { inFlight: false, pending: false },
    GROUP: { inFlight: false, pending: false }
  })

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const favicon = getFaviconElement()
    baseFaviconRef.current = favicon.href || '/favicon.ico'
  }, [])

  useEffect(() => {
    if (!userId) {
      reset()
      return
    }

    let active = true

    fetchChatUnread()
      .then((payload) => {
        if (!active) return
        setUnread(payload)
      })
      .catch((error) => {
        console.error('Failed to fetch chat unread counts:', error)
      })

    return () => {
      active = false
    }
  }, [reset, setUnread, userId])

  useEffect(() => {
    if (!userId) {
      setChatPanelState(false, null)
    }
  }, [setChatPanelState, userId])

  useEffect(() => {
    if (!userId || typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (window.Notification.permission !== 'default') {
      return
    }

    const requestPermission = () => {
      void ensureNotificationPermission()
      window.removeEventListener('click', requestPermission)
      window.removeEventListener('keydown', requestPermission)
    }

    window.addEventListener('click', requestPermission, { once: true })
    window.addEventListener('keydown', requestPermission, { once: true })

    return () => {
      window.removeEventListener('click', requestPermission)
      window.removeEventListener('keydown', requestPermission)
    }
  }, [userId])

  useEffect(() => {
    const title =
      totalUnreadCount > 0 ? `(${totalUnreadCount}) ${baseTitleRef.current}` : baseTitleRef.current
    document.title = title

    const baseFavicon = baseFaviconRef.current
    if (!baseFavicon) {
      return
    }

    const currentJob = ++faviconJobRef.current
    const favicon = getFaviconElement()

    if (totalUnreadCount <= 0) {
      favicon.href = baseFavicon
      return
    }

    void buildUnreadFavicon(baseFavicon, totalUnreadCount).then((href) => {
      if (faviconJobRef.current !== currentJob) {
        return
      }

      favicon.href = href
    })
  }, [totalUnreadCount])

  useEffect(() => {
    if (!userId) {
      return
    }

    const syncViewedChatRead = (chatType: ChatType) => {
      const syncState = readSyncRef.current[chatType]

      if (syncState.inFlight) {
        syncState.pending = true
        return
      }

      syncState.inFlight = true

      void markChatRead(chatType)
        .then(() => syncUnreadState())
        .then((unreadPayload) => {
          useChatUnreadStore.getState().setUnread(unreadPayload)
        })
        .catch((error) => {
          console.error('Failed to mark chat as read from realtime event:', error)
        })
        .finally(() => {
          syncState.inFlight = false

          if (syncState.pending) {
            syncState.pending = false
            syncViewedChatRead(chatType)
          }
        })
    }

    let subscription: { unsubscribe: () => void } | null = null

    const unsubscribeConnect = onStompConnect(() => {
      subscription?.unsubscribe()
      subscription = stompClient.subscribe('/user/queue/chat-unread', (frame) => {
        try {
          const parsed = chatUnreadNotificationSchema.safeParse(JSON.parse(frame.body))

          if (!parsed.success) {
            console.error('채팅 unread 알림 파싱 실패')
            return
          }

          const payload = parsed.data
          const state = useChatUnreadStore.getState()
          const isViewingSameChat =
            state.isChatPanelOpen &&
            state.activeChatType === payload.chatType &&
            document.visibilityState === 'visible'

          if (isViewingSameChat) {
            state.markChatReadLocally(payload.chatType)
            syncViewedChatRead(payload.chatType)
            return
          }

          state.setUnread(toUnreadPayload(payload))

          const shouldNotifyOutsideViewedChat =
            !state.isChatPanelOpen || state.activeChatType !== payload.chatType

          const shouldShowInAppNotification =
            !document.hidden &&
            document.visibilityState === 'visible' &&
            shouldNotifyOutsideViewedChat &&
            isChatToastEnabled(userId, payload.chatType)

          if (shouldShowInAppNotification) {
            showChatInAppToast(payload)
          }

          if (document.hidden) {
            void showChatBrowserNotification(payload, baseFaviconRef.current)
          }
        } catch {
          console.error('채팅 unread 알림 처리 실패')
        }
      })
    })

    return () => {
      unsubscribeConnect()
      subscription?.unsubscribe()
    }
  }, [userId])
}
