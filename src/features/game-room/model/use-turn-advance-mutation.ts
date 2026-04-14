import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { advanceTurn } from '../api/advance-turn'
import { gameRoomKeys, gameTurnKeys } from './query-keys'

export function useTurnAdvanceMutation(roomId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => advanceTurn(roomId),
    onSuccess: (response) => {
      const data = response.data

      if (data.gameFinished) {
        navigate(`/rooms/${roomId}/result`)
        return
      }

      // 새 턴 데이터로 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: gameTurnKeys.current(roomId) })
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.portfolio(roomId) })
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.holdings(roomId) })
      queryClient.invalidateQueries({ queryKey: gameRoomKeys.briefing(roomId) })
    }
  })
}
