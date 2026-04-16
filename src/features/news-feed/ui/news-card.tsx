import { Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

import SourceBadge from '@/shared/ui/source-badge'

import type { ClusterItem } from '../api/fetch-news-clusters'
import { getTimeAgo } from '../lib/get-time-ago'

interface NewsCardProps {
  cluster: ClusterItem
}

export default function NewsCard({ cluster }: NewsCardProps) {
  return (
    <Link to={`/news/${cluster.clusterId}`} className="group flex gap-4 rounded-2xl bg-white p-3">
      {/* Thumbnail */}
      <div className="h-[120px] w-[180px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {cluster.thumbnailUrl ? (
          <img
            src={cluster.thumbnailUrl}
            alt={cluster.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Layers className="h-8 w-8 text-wefin-subtle" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-wefin-text">
            {cluster.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-wefin-subtle">
            {cluster.summary}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-wefin-subtle">
          <span>{getTimeAgo(cluster.publishedAt)}</span>
          <SourceBadge sources={cluster.sources} sourceCount={cluster.sourceCount} />
        </div>
      </div>
    </Link>
  )
}
