import { useMutation, useQueryClient } from '@tanstack/react-query'

import { submitClusterFeedback } from '../api/cluster-interaction'
import type { FeedbackType } from '../api/fetch-cluster-detail'

export function useClusterFeedbackMutation(clusterId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: FeedbackType) => submitClusterFeedback(clusterId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news', 'cluster', clusterId] })
    }
  })
}
