import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateTodayQuests } from '@/features/quest/model/use-today-quests'

import { shareClusterNews } from '../api/share-cluster-news'

type UseShareClusterNewsOptions = {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useShareClusterNews(options?: UseShareClusterNewsOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clusterId: number) => shareClusterNews(clusterId),
    onSuccess: () => {
      void invalidateTodayQuests(queryClient)
      options?.onSuccess?.()
    },
    onError: (error) => {
      options?.onError?.(error)
    }
  })
}
