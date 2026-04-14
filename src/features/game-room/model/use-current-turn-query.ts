import { useQuery } from '@tanstack/react-query'

import { fetchCurrentTurn } from '../api/fetch-current-turn'
import { gameTurnKeys } from './query-keys'

export function useCurrentTurnQuery(roomId: string) {
  return useQuery({
    queryKey: gameTurnKeys.current(roomId),
    queryFn: () => fetchCurrentTurn(roomId),
    enabled: !!roomId,
    select: (response) => response.data
  })
}
