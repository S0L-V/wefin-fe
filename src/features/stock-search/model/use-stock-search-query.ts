import { useQuery } from '@tanstack/react-query'

import { fetchStockSearch } from '@/features/stock-search/api/fetch-stock-search'

export function useStockSearchQuery(keyword: string) {
  const trimmed = keyword.trim()

  return useQuery({
    queryKey: ['stocks', 'search', trimmed],
    queryFn: () => fetchStockSearch(trimmed),
    enabled: trimmed.length >= 1
  })
}
