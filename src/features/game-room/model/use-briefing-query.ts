import { useQuery } from '@tanstack/react-query'

import { fetchBriefing } from '../api/fetch-briefing'

export function useBriefingQuery(roomId: string) {
  return useQuery({
    queryKey: ['briefing', roomId],
    queryFn: () => fetchBriefing(roomId),
    enabled: !!roomId,
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
    retry: 0
  })
}
