import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { ClusterFeedParams } from '../api/fetch-news-clusters'
import { fetchNewsClustersWithFilter } from '../api/fetch-news-clusters'

export function useFilteredFeedQuery(params: ClusterFeedParams) {
  return useQuery({
    queryKey: ['news', 'filtered-feed', params],
    queryFn: () => fetchNewsClustersWithFilter(params),
    placeholderData: keepPreviousData
  })
}
