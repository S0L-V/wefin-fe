import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { advanceTurn } from '../api/advance-turn'

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
      queryClient.invalidateQueries({ queryKey: ['game-turn', 'current', roomId] })
      queryClient.invalidateQueries({ queryKey: ['game-room', 'portfolio', roomId] })
      queryClient.invalidateQueries({ queryKey: ['game-room', 'holdings', roomId] })
      queryClient.invalidateQueries({ queryKey: ['game-room', 'briefing', roomId] })
    }
  })
}
