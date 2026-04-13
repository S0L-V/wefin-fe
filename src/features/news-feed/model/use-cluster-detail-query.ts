import { useQuery } from '@tanstack/react-query'

import { fetchClusterDetail } from '../api/fetch-cluster-detail'

export function useClusterDetailQuery(clusterId: number) {
  return useQuery({
    queryKey: ['news', 'cluster', clusterId],
    queryFn: () => fetchClusterDetail(clusterId),
    enabled: clusterId > 0
  })
}
