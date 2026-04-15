import { useQuery } from '@tanstack/react-query'

import { fetchDailyRanking } from '../api/fetch-user-ranking'

export function useDailyRankingQuery() {
  return useQuery({
    queryKey: ['ranking', 'daily'],
    queryFn: fetchDailyRanking,
    staleTime: 30_000
  })
}
