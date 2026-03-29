import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createGameRoom, fetchGameRooms } from '../api/fetch-game-rooms'
import type { CreateRoomRequest } from './game-room.schema'

export function useGameRoomsQuery(status?: string) {
  return useQuery({
    queryKey: ['game-rooms', status],
    queryFn: () => fetchGameRooms(status)
  })
}

export function useCreateGameRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateRoomRequest) => createGameRoom(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-rooms'] })
    }
  })
}
