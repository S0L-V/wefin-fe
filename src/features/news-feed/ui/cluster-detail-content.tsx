import { useParams } from 'react-router-dom'

import SeoHead from '@/shared/ui/seo-head'

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
        <div className="h-6 w-32 animate-pulse rounded bg-wefin-surface-2" />
        <div className="h-10 w-full animate-pulse rounded bg-wefin-surface-2" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-wefin-surface-2" />
        <div className="h-48 w-full animate-pulse rounded-2xl bg-wefin-surface-2" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-wefin-surface-2" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-wefin-surface-2" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-wefin-surface-2" />
        </div>
      </div>
    )
  }

  if (isError || !cluster) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <svg
          width="100"
          height="60"
          viewBox="0 0 100 60"
          fill="none"
          className="mb-4 text-wefin-muted"
        >
          <polyline
            points="5,50 25,40 45,45 65,20 85,30 95,25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <p className="text-sm font-bold text-wefin-text">기사를 찾을 수 없어요</p>
        <p className="mt-1 text-xs text-wefin-subtle">삭제되었거나 존재하지 않는 기사입니다.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-wefin-surface p-4 sm:rounded-3xl sm:p-8">
      <SeoHead title={cluster.title} description={cluster.summary} path={`/news/${clusterId}`} />
      <ClusterDetailHeader cluster={cluster} />
      <ClusterDetailSections sections={cluster.sections} articleContent={cluster.articleContent} />
      <ClusterDetailFooter cluster={cluster} />
    </div>
  )
}
