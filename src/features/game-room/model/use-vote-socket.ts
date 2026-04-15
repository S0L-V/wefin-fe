import { useEffect } from 'react'

import { onStompConnect, stompClient } from '@/shared/api/stomp-client'

import { useVoteStore } from './use-vote-store'
import { voteEventSchema } from './vote.schema'

/**
 * 투표 WebSocket 구독.
 * VOTE_START / VOTE_UPDATE / VOTE_RESULT 이벤트를 수신하여
 * vote store를 업데이트 → VoteModal이 반응.
 */
export function useVoteSocket(roomId: string) {
  const { startVote, updateVote, finishVote } = useVoteStore()

  useEffect(() => {
    if (!roomId) return

    let subscription: { unsubscribe: () => void } | null = null

    function subscribe() {
      subscription?.unsubscribe()
      subscription = stompClient.subscribe(`/topic/rooms/${roomId}/vote`, (message) => {
        try {
          const event = voteEventSchema.parse(JSON.parse(message.body))

          switch (event.type) {
            case 'VOTE_START':
              startVote(event.initiator, event.totalCount, event.timeoutSeconds)
              break
            case 'VOTE_UPDATE':
              updateVote(event.agreeCount, event.disagreeCount, event.totalCount)
              break
            case 'VOTE_RESULT':
              finishVote(event.passed, event.agreeCount, event.disagreeCount)
              break
          }
        } catch {
          console.warn('[WebSocket] 투표 메시지 파싱 실패:', message.body)
        }
      })
    }

    const removeListener = onStompConnect(subscribe)

    return () => {
      subscription?.unsubscribe()
      removeListener()
    }
  }, [roomId, startVote, updateVote, finishVote])
}
