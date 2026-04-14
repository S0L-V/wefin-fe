import { useQuery } from '@tanstack/react-query'

import { fetchMarketTrendsOverview } from '../api/fetch-market-trends-overview'

/** 오늘의 금융 동향 조회. 배치가 30분 주기라 5분 staleTime으로 여유 둠 */
export function useMarketTrendsOverviewQuery() {
  return useQuery({
    queryKey: ['market-trends', 'overview'],
    queryFn: fetchMarketTrendsOverview,
    staleTime: 5 * 60 * 1000
  })
}
