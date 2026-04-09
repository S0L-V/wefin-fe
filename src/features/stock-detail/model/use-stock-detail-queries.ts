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
    staleTime: 5_000,
    // WS push가 도착하지 않는 종목/시간대(장외, 비활성 종목, BE→한투 일시 단절)에도
    // 베이스라인이 stale해지지 않도록 5초 폴링. WS 메시지가 들어오면 그 위에 덮어씌워진다.
    // 백그라운드 탭에서는 polling 중단해 불필요한 트래픽을 피한다.
    refetchInterval: 5_000,
    refetchIntervalInBackground: false
  })
}

export function useOrderbookQuery(code: string) {
  return useQuery({
    queryKey: ['stocks', code, 'orderbook'],
    queryFn: () => fetchOrderbook(code),
    enabled: !!code,
    staleTime: 5_000,
    refetchInterval: 5_000,
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
