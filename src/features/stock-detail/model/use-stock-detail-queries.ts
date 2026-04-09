import { useQuery } from '@tanstack/react-query'

import {
  fetchCandles,
  fetchOrderbook,
  fetchRecentTrades,
  fetchStockInfo,
  fetchStockPrice
} from '@/features/stock-detail/api/fetch-stock-detail'

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
    staleTime: 5_000
  })
}

export function useOrderbookQuery(code: string) {
  return useQuery({
    queryKey: ['stocks', code, 'orderbook'],
    queryFn: () => fetchOrderbook(code),
    enabled: !!code,
    staleTime: 5_000
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
