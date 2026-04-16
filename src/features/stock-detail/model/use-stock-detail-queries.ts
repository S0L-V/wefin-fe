import { useQuery } from '@tanstack/react-query'

import { fetchInvestorTrend } from '@/features/stock-detail/api/fetch-investor-trend'
import {
  fetchCandles,
  fetchOrderbook,
  fetchRecentTrades,
  fetchStockInfo,
  fetchStockPrice
} from '@/features/stock-detail/api/fetch-stock-detail'
import { fetchStockInfoDetail } from '@/features/stock-detail/api/fetch-stock-info-detail'
import {
  fetchStockDisclosures,
  fetchStockNews
} from '@/features/stock-detail/api/fetch-stock-news-disclosure'
import { isWsActive } from '@/features/stock-detail/model/use-stock-socket'

export function useStockInfoQuery(code: string) {
  return useQuery({
    queryKey: ['stocks', code, 'info'],
    queryFn: () => fetchStockInfo(code),
    enabled: !!code,
    staleTime: 300_000
  })
}

export function useStockPriceQuery(code: string) {
  return useQuery({
    queryKey: ['stocks', code, 'price'],
    queryFn: () => fetchStockPrice(code),
    enabled: !!code,
    staleTime: 5_000,
    // WS가 활성 상태면 polling을 꺼서 불필요한 트래픽을 줄인다.
    // WS가 10초 이상 수신되지 않으면 5초 폴링으로 폴백한다.
    refetchInterval: () => (isWsActive() ? 30_000 : 5_000),
    refetchIntervalInBackground: false
  })
}

export function useOrderbookQuery(code: string) {
  return useQuery({
    queryKey: ['stocks', code, 'orderbook'],
    queryFn: () => fetchOrderbook(code),
    enabled: !!code,
    staleTime: 5_000,
    refetchInterval: () => (isWsActive() ? 30_000 : 5_000),
    refetchIntervalInBackground: false
  })
}

export function useCandlesQuery(code: string, periodCode: string = 'D') {
  return useQuery({
    queryKey: ['stocks', code, 'candles', periodCode],
    queryFn: () => fetchCandles(code, periodCode),
    enabled: !!code,
    staleTime: 60_000
  })
}

export function useRecentTradesQuery(code: string) {
  return useQuery({
    queryKey: ['stocks', code, 'trades', 'recent'],
    queryFn: () => fetchRecentTrades(code),
    enabled: !!code,
    staleTime: 5_000
  })
}

export function useStockInfoDetailQuery(code: string, enabled = true) {
  return useQuery({
    queryKey: ['stocks', code, 'info-detail'],
    queryFn: () => fetchStockInfoDetail(code),
    enabled: !!code && enabled,
    // BE 캐시가 6h~24h 이라 FE는 10분 staleTime으로 충분
    staleTime: 10 * 60_000
  })
}

export function useStockNewsQuery(code: string, enabled = true) {
  return useQuery({
    queryKey: ['stocks', code, 'news'],
    queryFn: () => fetchStockNews(code),
    enabled: !!code && enabled,
    // BE 뉴스 캐시 10분
    staleTime: 5 * 60_000
  })
}

export function useStockDisclosuresQuery(code: string, enabled = true) {
  return useQuery({
    queryKey: ['stocks', code, 'disclosures'],
    queryFn: () => fetchStockDisclosures(code),
    enabled: !!code && enabled,
    // BE 공시 캐시 30분
    staleTime: 15 * 60_000
  })
}

export function useInvestorTrendQuery(code: string, enabled = true) {
  return useQuery({
    queryKey: ['stocks', code, 'investor-trend'],
    queryFn: () => fetchInvestorTrend(code),
    enabled: !!code && enabled,
    // BE investorTrend 캐시 10분
    staleTime: 10 * 60_000
  })
}
