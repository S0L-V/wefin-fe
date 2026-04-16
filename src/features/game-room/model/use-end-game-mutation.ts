import { useMutation, useQueryClient } from '@tanstack/react-query'

import { endGame } from '../api/end-game'
import { gameRoomKeys } from './query-keys'

export function useEndGameMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => endGame(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.detail(roomId) })
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.portfolio(roomId) })
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.holdings(roomId) })
    }
  })
}
