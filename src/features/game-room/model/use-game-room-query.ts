import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createGameRoom,
  fetchGameHistory,
  fetchGameRoomDetail,
  fetchGameRooms,
  joinGameRoom,
  leaveGameRoom,
  startGameRoom
} from '../api/fetch-game-rooms'
import type { CreateRoomRequest } from './game-room.schema'
import { gameRoomKeys } from './query-keys'

// === Query ===

export function useGameRoomsQuery() {
  return useQuery({
    queryKey: gameRoomKeys.list(),
    queryFn: fetchGameRooms,
    refetchInterval: 5_000
  })
}

export function useGameHistoryQuery(page: number, size: number) {
  return useQuery({
    queryKey: gameRoomKeys.history(page, size),
    queryFn: () => fetchGameHistory(page, size)
  })
}

export function useGameRoomDetailQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.detail(roomId),
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
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.list() })
    }
  })
}

export function useJoinGameRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => joinGameRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.all })
    }
  })
}

export function useLeaveGameRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => leaveGameRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.all })
    }
  })
}

export function useStartGameRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => startGameRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.all })
    }
  })
}
