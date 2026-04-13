import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { ClusterTab } from '../api/fetch-news-clusters'
import { fetchNewsClusters } from '../api/fetch-news-clusters'

export function useNewsFeedQuery(tab: ClusterTab, size: number, cursor?: string | null) {
  return useQuery({
    queryKey: ['news', 'feed', tab, size, cursor],
    queryFn: () => fetchNewsClusters(tab, size, cursor),
    placeholderData: keepPreviousData
  })
}
