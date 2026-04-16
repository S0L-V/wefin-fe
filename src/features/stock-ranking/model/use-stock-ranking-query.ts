import { useQuery } from '@tanstack/react-query'

import { fetchStockRanking } from '../api/fetch-stock-ranking'
import type { RankingTab } from '../lib/ranking-data'

export function useStockRankingQuery(tab: RankingTab, limit = 30) {
  return useQuery({
    queryKey: ['stocks', 'ranking', tab, limit],
    queryFn: () => fetchStockRanking(tab, limit),
    staleTime: 5_000,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false
  })
}
