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
        setErrorMessage('�׷� ä�� �����͸� �ҷ����� ���߽��ϴ�.')
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
    if (!client || !globalConnected || !groupMeta?.groupId) {
      messageSubscriptionRef.current?.unsubscribe()
      messageSubscriptionRef.current = null
      errorSubscriptionRef.current?.unsubscribe()
      errorSubscriptionRef.current = null
      return
    }

    // AppLayout���� �ϳ��� STOMP ������ �����ϰ� �����Ƿ� �׷� ä���� ������ �����ϰ� ������ �߰��Ѵ�.
    messageSubscriptionRef.current?.unsubscribe()
    messageSubscriptionRef.current = client.subscribe(
      `/topic/chat/group/${groupMeta.groupId}`,
      (frame) => {
        try {
          const parsed = groupChatMessageSchema.safeParse(JSON.parse(frame.body))
          if (!parsed.success) {
            console.error('�׷� ä�� �޽��� �Ľ� ����')
            return
          }

          appendMessage(parsed.data)
        } catch {
          console.error('�׷� ä�� �޽��� ó�� ����')
        }
      }
    )

    // ����� ���� ���� ť�� �Բ� �����ؼ� ���� ������ ���� ���и� ��ʷ� �ȳ��ϰ� �ڵ����� �����.
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
        console.error('�׷� ä�� ���� �޽��� �Ľ� ����')
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
  }, [appendMessage, client, globalConnected, groupMeta?.groupId, setErrorMessage])
}
