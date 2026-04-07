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

export function useGroupChatSocket(userId: string) {
  const client = useGlobalChatStore((state) => state.client)
  const globalConnected = useGlobalChatStore((state) => state.connected)

  const setUserId = useGroupChatStore((state) => state.setUserId)
  const groupMeta = useGroupChatStore((state) => state.groupMeta)
  const setGroupMeta = useGroupChatStore((state) => state.setGroupMeta)
  const setMessages = useGroupChatStore((state) => state.setMessages)
  const appendMessage = useGroupChatStore((state) => state.appendMessage)
  const setConnected = useGroupChatStore((state) => state.setConnected)
  const setLoading = useGroupChatStore((state) => state.setLoading)
  const setErrorMessage = useGroupChatStore((state) => state.setErrorMessage)

  const messageSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const errorSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

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

    Promise.all([fetchGroupChatMeta(userId), fetchGroupChatMessages(userId)])
      .then(([meta, messages]) => {
        if (!active) return
        setGroupMeta(meta)
        setMessages(messages)
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
  }, [setErrorMessage, setGroupMeta, setLoading, setMessages, userId])

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
    // 그룹 채팅은 별도 소켓을 새로 열지 않고 같은 연결에 구독만 추가한다.
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

    // 사용자 전용 에러 큐를 함께 구독해서 그룹 채팅 전송 실패도 같은 화면에서 안내한다.
    errorSubscriptionRef.current?.unsubscribe()
    errorSubscriptionRef.current = client.subscribe('/user/queue/errors', (frame) => {
      try {
        const error = JSON.parse(frame.body) as ChatErrorMessage
        setErrorMessage(error.message)
      } catch {
        console.error('그룹 채팅 에러 메시지 파싱 실패')
      }
    })

    return () => {
      messageSubscriptionRef.current?.unsubscribe()
      messageSubscriptionRef.current = null
      errorSubscriptionRef.current?.unsubscribe()
      errorSubscriptionRef.current = null
    }
  }, [appendMessage, client, groupMeta?.groupId, setErrorMessage])
}
