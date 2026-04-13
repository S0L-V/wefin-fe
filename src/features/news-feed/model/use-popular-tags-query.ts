import { useQuery } from '@tanstack/react-query'

import { fetchPopularTags } from '../api/fetch-popular-tags'

export function usePopularTagsQuery(type: 'SECTOR' | 'STOCK') {
  return useQuery({
    queryKey: ['news', 'tags', 'popular', type],
    queryFn: () => fetchPopularTags(type)
  })
}
