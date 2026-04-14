import { baseApi } from '@/shared/api/base-api'

import type { FeedbackType } from './fetch-cluster-detail'

export async function markClusterRead(clusterId: number): Promise<void> {
  await baseApi.post(`/news/clusters/${clusterId}/read`)
}

export async function submitClusterFeedback(clusterId: number, type: FeedbackType): Promise<void> {
  await baseApi.post(`/news/clusters/${clusterId}/feedback`, { type })
}
