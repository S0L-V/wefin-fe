import { useNavigate } from 'react-router-dom'

import {
  useGameRoomDetailQuery,
  useJoinGameRoomMutation,
  useLeaveGameRoomMutation,
  useStartGameRoomMutation
} from './use-game-room-query'

export function useWaitingRoom(roomId: string) {
  const navigate = useNavigate()
  const { data, isLoading } = useGameRoomDetailQuery(roomId)

  const joinMutation = useJoinGameRoomMutation()
  const leaveMutation = useLeaveGameRoomMutation()
  const startMutation = useStartGameRoomMutation()

  const room = data?.data
  const participants = room?.participants ?? []
  const activeParticipants = participants.filter((p) => p.status === 'ACTIVE')
  const isHost = activeParticipants.some((p) => p.isLeader && p.userId === currentUserId())
  const canStart = isHost && activeParticipants.length >= 2 && room?.status === 'WAITING'

  function handleJoin() {
    joinMutation.mutate(roomId)
  }

  function handleLeave() {
    leaveMutation.mutate(roomId, {
      onSuccess: () => navigate('/history')
    })
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
    currentUserId: currentUserId(),
    handleJoin,
    handleLeave,
    handleStart,
    isJoining: joinMutation.isPending,
    isLeaving: leaveMutation.isPending,
    isStarting: startMutation.isPending
  }
}

// TODO: JWT 연동 후 실제 유저 ID로 교체
function currentUserId() {
  return '00000000-0000-4000-a000-000000000001'
}
