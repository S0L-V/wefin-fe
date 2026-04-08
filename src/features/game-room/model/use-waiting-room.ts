import { getCurrentUserId } from '@/shared/lib/get-current-user-id'

import {
  useGameRoomDetailQuery,
  useJoinGameRoomMutation,
  useStartGameRoomMutation
} from './use-game-room-query'

export function useWaitingRoom(roomId: string) {
  const { data, isLoading } = useGameRoomDetailQuery(roomId)

  const joinMutation = useJoinGameRoomMutation()
  const startMutation = useStartGameRoomMutation()

  const room = data?.data
  const participants = room?.participants ?? []
  const activeParticipants = participants.filter((p) => p.status === 'ACTIVE')
  const userId = getCurrentUserId()
  const isHost = activeParticipants.some((p) => p.isLeader && p.userId === userId)
  const canStart = isHost && activeParticipants.length >= 2 && room?.status === 'WAITING'

  function handleJoin() {
    joinMutation.mutate(roomId)
  }

  function handleStart() {
    startMutation.mutate(roomId)
  }

  return {
    room,
    activeParticipants,
    isHost,
    canStart,
    isLoading,
    currentUserId: userId,
    handleJoin,
    handleStart,
    isJoining: joinMutation.isPending,
    isStarting: startMutation.isPending
  }
}
