import { useEffect, useRef } from 'react'

import {
  fetchGroupChatMessages,
  groupChatMessageSchema
} from '@/features/chat/api/group/fetch-group-chat-messages'
import { fetchGroupChatMeta } from '@/features/chat/api/group/fetch-group-chat-meta'
import { useGlobalChatStore } from '@/features/chat/model/global/global-chat-store'
import { useGroupChatStore } from '@/features/chat/model/group/group-chat-store'

type ChatErrorMessage = {
  code: string
  message: string
  remainingSeconds?: number
}

const FALLBACK_ERROR_TIMEOUT_MS = 3000

export function useGroupChatSocket(userId: string) {
  const client = useGlobalChatStore((state) => state.client)
  const globalConnected = useGlobalChatStore((state) => state.connected)

  const setUserId = useGroupChatStore((state) => state.setUserId)
  const groupMeta = useGroupChatStore((state) => state.groupMeta)
  const setGroupMeta = useGroupChatStore((state) => state.setGroupMeta)
  const setInitialPage = useGroupChatStore((state) => state.setInitialPage)
  const appendMessage = useGroupChatStore((state) => state.appendMessage)
  const setConnected = useGroupChatStore((state) => state.setConnected)
  const setLoading = useGroupChatStore((state) => state.setLoading)
  const setErrorMessage = useGroupChatStore((state) => state.setErrorMessage)

  const messageSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const errorSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const errorTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setUserId(userId)
  }, [setUserId, userId])

  useEffect(() => {
    if (!userId) {
      return
    }

    let active = true

    setLoading(true)
    setErrorMessage(null)

    Promise.all([fetchGroupChatMeta(), fetchGroupChatMessages()])
      .then(([meta, page]) => {
        if (!active) return
        setGroupMeta(meta)
        setInitialPage(page)
        setLoading(false)
      })
      .catch((error) => {
        if (!active) return
        console.error('Failed to load group chat data:', error)
        setErrorMessage('그룹 채팅 데이터를 불러오지 못했습니다.')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [setErrorMessage, setGroupMeta, setInitialPage, setLoading, userId])

  useEffect(() => {
    setConnected(globalConnected)
  }, [globalConnected, setConnected])

  useEffect(() => {
    if (!client?.connected || !groupMeta?.groupId) {
      messageSubscriptionRef.current?.unsubscribe()
      messageSubscriptionRef.current = null
      errorSubscriptionRef.current?.unsubscribe()
      errorSubscriptionRef.current = null
      return
    }

    // AppLayout에서 이미 하나의 STOMP 연결을 유지하고 있으므로
    // 그룹 채팅은 같은 연결에 구독만 추가해서 재사용한다.
    messageSubscriptionRef.current?.unsubscribe()
    messageSubscriptionRef.current = client.subscribe(
      `/topic/chat/group/${groupMeta.groupId}`,
      (frame) => {
        try {
          const parsed = groupChatMessageSchema.safeParse(JSON.parse(frame.body))
          if (!parsed.success) {
            console.error('그룹 채팅 메시지 파싱 실패')
            return
          }

          appendMessage(parsed.data)
        } catch {
          console.error('그룹 채팅 메시지 처리 실패')
        }
      }
    )

    // 사용자 전용 에러 큐를 함께 구독해서 도배 감지나 전송 실패를 배너로 안내하고,
    // 일정 시간이 지나면 자동으로 지워서 계속 남지 않게 한다.
    errorSubscriptionRef.current?.unsubscribe()
    errorSubscriptionRef.current = client.subscribe('/user/queue/errors', (frame) => {
      try {
        const error = JSON.parse(frame.body) as ChatErrorMessage
        const timeoutMs = (error.remainingSeconds ?? 3) * 1000

        setErrorMessage(error.message)

        if (errorTimeoutRef.current != null) {
          window.clearTimeout(errorTimeoutRef.current)
        }

        errorTimeoutRef.current = window.setTimeout(
          () => {
            setErrorMessage(null)
            errorTimeoutRef.current = null
          },
          Math.max(timeoutMs, FALLBACK_ERROR_TIMEOUT_MS)
        )
      } catch {
        console.error('그룹 채팅 에러 메시지 파싱 실패')
      }
    })

    return () => {
      messageSubscriptionRef.current?.unsubscribe()
      messageSubscriptionRef.current = null
      errorSubscriptionRef.current?.unsubscribe()
      errorSubscriptionRef.current = null

      if (errorTimeoutRef.current != null) {
        window.clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = null
      }
    }
  }, [appendMessage, client, groupMeta?.groupId, setErrorMessage])
}
