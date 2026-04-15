import { useQuery } from '@tanstack/react-query'

import { fetchPersonalizedMarketTrends } from '../api/fetch-market-trends-overview'

/**
 * 사용자 관심사 기반 맞춤 동향 조회 (lazy).
 *
 * 버튼 클릭 시점에만 호출되도록 enabled를 외부에서 제어한다. AI 호출이라 staleTime을 길게 두어
 * 같은 세션에서 반복 토글 시 불필요한 재호출을 막는다
 */
export function usePersonalizedMarketTrendsQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['market-trends', 'personalized'],
    queryFn: fetchPersonalizedMarketTrends,
    enabled,
    staleTime: 30 * 60 * 1000
  })
}
