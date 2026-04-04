import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createGameRoom,
  fetchGameRoomDetail,
  fetchGameRooms,
  joinGameRoom,
  leaveGameRoom,
  startGameRoom
} from '../api/fetch-game-rooms'
import type { CreateRoomRequest } from './game-room.schema'

// === Query ===

export function useGameRoomsQuery() {
  return useQuery({
    queryKey: ['game-room', 'list'],
    queryFn: fetchGameRooms
  })
}

export function useGameRoomDetailQuery(roomId: string) {
  return useQuery({
    queryKey: ['game-room', 'detail', roomId],
    queryFn: () => fetchGameRoomDetail(roomId),
    enabled: !!roomId
  })
}

// === Mutation ===

export function useCreateGameRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateRoomRequest) => createGameRoom(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-room', 'list'] })
    }
  })
}

export function useJoinGameRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => joinGameRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-room'] })
    }
  })
}

export function useLeaveGameRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => leaveGameRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-room'] })
    }
  })
}

export function useStartGameRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => startGameRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-room'] })
    }
  })
}
