import { useMutation } from '@tanstack/react-query'

import { shareClusterNews } from '../api/share-cluster-news'

export function useShareClusterNews() {
  return useMutation({
    mutationFn: (clusterId: number) => shareClusterNews(clusterId)
  })
}
