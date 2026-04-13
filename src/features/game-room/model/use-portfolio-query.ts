import { useQuery } from '@tanstack/react-query'

import { fetchHoldings, fetchPortfolio } from '../api/fetch-portfolio'

export function usePortfolioQuery(roomId: string) {
  return useQuery({
    queryKey: ['game-room', 'portfolio', roomId],
    queryFn: () => fetchPortfolio(roomId),
    enabled: !!roomId
  })
}

export function useHoldingsQuery(roomId: string) {
  return useQuery({
    queryKey: ['game-room', 'holdings', roomId],
    queryFn: () => fetchHoldings(roomId),
    enabled: !!roomId
  })
}
