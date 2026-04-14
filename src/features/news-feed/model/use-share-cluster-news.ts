import { useMutation } from '@tanstack/react-query'

import { shareClusterNews } from '../api/share-cluster-news'

type UseShareClusterNewsOptions = {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useShareClusterNews(options?: UseShareClusterNewsOptions) {
  return useMutation({
    mutationFn: (clusterId: number) => shareClusterNews(clusterId),
    onSuccess: () => {
      options?.onSuccess?.()
    },
    onError: (error) => {
      options?.onError?.(error)
    }
  })
}
