import { useQuery } from '@tanstack/react-query'

import { fetchChart } from '../api/fetch-stocks'
import { gameRoomKeys } from './query-keys'

export function useStockChart(symbol: string | null, roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.stockChart(symbol ?? '', roomId),
    queryFn: () => fetchChart(symbol!, roomId),
    enabled: !!symbol,
    select: (response) => response.data,
    staleTime: 60_000
  })
}
