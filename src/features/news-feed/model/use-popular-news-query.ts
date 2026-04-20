import { useQuery } from '@tanstack/react-query'

import { fetchPopularNewsClusters } from '../api/fetch-news-clusters'

export function usePopularNewsQuery(limit = 5) {
  return useQuery({
    queryKey: ['news', 'popular', limit],
    queryFn: () => fetchPopularNewsClusters(limit),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })
}
