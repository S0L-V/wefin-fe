import { useQuery } from '@tanstack/react-query'

import { fetchCurrentTurn } from '../api/fetch-current-turn'

export function useCurrentTurnQuery(roomId: string) {
  return useQuery({
    queryKey: ['game-turn', 'current', roomId],
    queryFn: () => fetchCurrentTurn(roomId),
    enabled: !!roomId,
    select: (response) => response.data
  })
}
