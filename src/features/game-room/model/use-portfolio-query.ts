import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { refreshTodayQuestsAfterRealtimeAction } from '@/features/quest/model/use-today-quests'

import { fetchHoldings, fetchPortfolio } from '../api/fetch-portfolio'
import { gameRoomKeys } from './query-keys'

export function usePortfolioQuery(roomId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: gameRoomKeys.portfolio(roomId),
    queryFn: () => fetchPortfolio(roomId),
    enabled: !!roomId
  })

  useEffect(() => {
    if (query.data) {
      refreshTodayQuestsAfterRealtimeAction(queryClient)
    }
  }, [query.data, queryClient])

  return query
}

export function useHoldingsQuery(roomId: string) {
  return useQuery({
    queryKey: gameRoomKeys.holdings(roomId),
    queryFn: () => fetchHoldings(roomId),
    enabled: !!roomId
  })
}
