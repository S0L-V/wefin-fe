import { useQuery } from '@tanstack/react-query'

import { fetchRankings } from '../api/fetch-rankings'
import { gameRoomKeys } from './query-keys'

export function useRankingQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.rankings(roomId),
    queryFn: () => fetchRankings(roomId),
    enabled: !!roomId
  })
}
