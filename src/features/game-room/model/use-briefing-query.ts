import { useQuery } from '@tanstack/react-query'

import { fetchBriefing, fetchBriefings } from '../api/fetch-briefing'
import { gameRoomKeys } from './query-keys'

export function useBriefingQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.briefing(roomId),
    queryFn: () => fetchBriefing(roomId),
    enabled: !!roomId,
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 5_000
  })
}

export function useBriefingsQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.briefings(roomId),
    queryFn: () => fetchBriefings(roomId),
    enabled: !!roomId,
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 5_000
  })
}
