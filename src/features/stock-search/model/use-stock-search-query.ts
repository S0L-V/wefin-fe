import { useQuery } from '@tanstack/react-query'

import { fetchStockSearch } from '@/features/stock-search/api/fetch-stock-search'
import { useDebouncedValue } from '@/features/stock-search/model/use-debounced-value'

export function useStockSearchQuery(keyword: string) {
  const trimmed = keyword.trim()
  const debounced = useDebouncedValue(trimmed)

  return useQuery({
    queryKey: ['stocks', 'search', debounced],
    queryFn: () => fetchStockSearch(debounced),
    enabled: debounced.length >= 1
  })
}
