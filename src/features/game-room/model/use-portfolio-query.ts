import { useQuery } from '@tanstack/react-query'

import { fetchHoldings, fetchPortfolio } from '../api/fetch-portfolio'
import { gameRoomKeys } from './query-keys'

export function usePortfolioQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.portfolio(roomId),
    queryFn: () => fetchPortfolio(roomId),
    enabled: !!roomId
  })
}

export function useHoldingsQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.holdings(roomId),
    queryFn: () => fetchHoldings(roomId),
    enabled: !!roomId
  })
}
