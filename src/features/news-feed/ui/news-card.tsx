import { Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { ClusterItem } from '../api/fetch-news-clusters'
import { getTimeAgo } from '../lib/get-time-ago'

interface NewsCardProps {
  cluster: ClusterItem
}

const INITIAL_COLORS = ['#2b3a4a', '#24a8ab', '#6b7b8d', '#3b82f6', '#8b5cf6']

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase()
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
            <Layers className="h-8 w-8 text-gray-300" />
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
              {getInitial(src.publisherName)}
            </span>
          ))}
        </span>
      )}
      {sourceCount}개 출처
    </span>
  )
}
