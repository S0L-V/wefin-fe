import { Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { ClusterItem } from '../api/fetch-news-clusters'
import { getTimeAgo } from '../lib/get-time-ago'

interface NewsListCardProps {
  cluster: ClusterItem
}

export default function NewsListCard({ cluster }: NewsListCardProps) {
  return (
    <Link
      to={`/news/${cluster.clusterId}`}
      className="group flex gap-4 rounded-2xl p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-wefin-bg/50 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {cluster.thumbnailUrl ? (
          <img
            src={cluster.thumbnailUrl}
            alt={cluster.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Layers className="h-5 w-5 text-wefin-line" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-wefin-text transition-colors group-hover:text-wefin-mint-deep">
            {cluster.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-wefin-text/60">
            {cluster.summary}
          </p>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-wefin-subtle">
          <span>{getTimeAgo(cluster.publishedAt)}</span>
          {cluster.sourceCount > 0 && (
            <>
              <span className="text-wefin-line">·</span>
              <span>{cluster.sourceCount}개 출처</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
