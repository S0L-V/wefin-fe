import { useQuery } from '@tanstack/react-query'

import { fetchStockPrice } from '../api/fetch-stock-price'

export function useStockPriceQuery(code: string) {
  return useQuery({
    queryKey: ['stocks', 'price', code],
    queryFn: () => fetchStockPrice(code),
    staleTime: 60_000,
    enabled: Boolean(code)
  })
}
