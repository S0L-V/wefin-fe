import { useQuery } from '@tanstack/react-query'

import {
  fetchPersonalizedMarketTrends,
  fetchPersonalizedMarketTrendsCached
} from '../api/fetch-market-trends-overview'

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

/**
 * TTL 내 캐시만 조회하는 쿼리. AI 재생성을 유발하지 않아 페이지 진입 시 자동 호출이 안전하다.
 *
 * 캐시 miss/stale 시 data는 {@code null}로 반환되며, 호출 측은 null-여부로 노출 분기한다.
 * 로그인 사용자에 한해 {@code enabled}로 제한한다
 */
export function usePersonalizedMarketTrendsCachedQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['market-trends', 'personalized', 'cached'],
    queryFn: fetchPersonalizedMarketTrendsCached,
    enabled,
    staleTime: 30 * 60 * 1000
  })
}
