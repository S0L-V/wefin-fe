import { Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { ClusterItem } from '../api/fetch-news-clusters'
import { getTimeAgo } from '../lib/get-time-ago'

interface NewsListCardProps {
  cluster: ClusterItem
}

const INITIAL_COLORS = ['#2b3a4a', '#24a8ab', '#6b7b8d', '#3b82f6', '#8b5cf6']

export default function NewsListCard({ cluster }: NewsListCardProps) {
  return (
    <Link
      to={`/news/${cluster.clusterId}`}
      className="group flex gap-5 border-b border-gray-100 py-5 last:border-b-0"
    >
      {/* Thumbnail */}
      <div className="h-[140px] w-[220px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {cluster.thumbnailUrl ? (
          <img
            src={cluster.thumbnailUrl}
            alt={cluster.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Layers className="h-10 w-10 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-wefin-text">
            {cluster.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-wefin-subtle">
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

function SourceBadge({
  sources,
  sourceCount
}: {
  sources: ClusterItem['sources']
  sourceCount: number
}) {
  const visibleSources = sources.slice(0, 2)

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[10px] leading-none text-wefin-subtle">
      {visibleSources.length > 0 && (
        <span className="flex -space-x-1">
          {visibleSources.map((src, i) => (
            <span
              key={i}
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-bold text-white ring-1 ring-white"
              style={{ backgroundColor: INITIAL_COLORS[i % INITIAL_COLORS.length] }}
            >
              {src.publisherName.charAt(0).toUpperCase()}
            </span>
          ))}
        </span>
      )}
      {sourceCount}개 출처
    </span>
  )
}
