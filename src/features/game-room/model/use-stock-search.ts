import { useQuery } from '@tanstack/react-query'

import { searchStocks } from '../api/fetch-stocks'

export function useStockSearch(roomId: string, keyword: string) {
  return useQuery({
    queryKey: ['stockSearch', roomId, keyword],
    queryFn: () => searchStocks(roomId, keyword),
    enabled: keyword.length >= 1,
    select: (response) => response.data,
    staleTime: 30_000
  })
}
