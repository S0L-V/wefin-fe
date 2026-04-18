import { useParams } from 'react-router-dom'

import { useClusterDetailQuery } from '../model/use-cluster-detail-query'
import { useMarkClusterRead } from '../model/use-mark-cluster-read'
import ClusterDetailFooter from './cluster-detail-footer'
import ClusterDetailHeader from './cluster-detail-header'
import ClusterDetailSections from './cluster-detail-sections'

export default function ClusterDetailContent() {
  const { clusterId } = useParams<{ clusterId: string }>()
  const numericClusterId = Number(clusterId)
  const { data: cluster, isLoading, isError } = useClusterDetailQuery(numericClusterId)

  useMarkClusterRead(numericClusterId, cluster?.isRead)

  if (isLoading) {
    return (
      <div className="space-y-6 py-8">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-48 w-full animate-pulse rounded-2xl bg-gray-100" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    )
  }

  if (isError || !cluster) {
    return (
      <div className="py-20 text-center text-sm text-wefin-subtle">뉴스를 불러오지 못했습니다</div>
    )
  }

  return (
    <div className="rounded-3xl bg-white p-8">
      <ClusterDetailHeader cluster={cluster} />
      <ClusterDetailSections sections={cluster.sections} articleContent={cluster.articleContent} />
      <ClusterDetailFooter cluster={cluster} />
    </div>
  )
}
