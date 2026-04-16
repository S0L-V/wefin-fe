import { useQuery } from '@tanstack/react-query'

import { fetchMarketIndices, type MarketIndicesParams } from '../api/fetch-market-indices'

export function useMarketIndicesQuery(params: MarketIndicesParams = {}) {
  return useQuery({
    queryKey: ['market', 'indices', params],
    queryFn: () => fetchMarketIndices(params),
    staleTime: 10_000,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false
  })
}
