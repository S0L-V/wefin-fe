import { useQuery } from '@tanstack/react-query'

import { fetchStockSearch } from '@/features/stock-search/api/fetch-stock-search'

export function useStockSearchQuery(keyword: string) {
  return useQuery({
    queryKey: ['stocks', 'search', keyword],
    queryFn: () => fetchStockSearch(keyword),
    enabled: keyword.length >= 1
  })
}
