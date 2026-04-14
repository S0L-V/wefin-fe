import { ArrowLeft, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { ClusterDetail } from '../api/fetch-cluster-detail'
import { getTimeAgo } from '../lib/get-time-ago'
import { useShareClusterNewsAction } from '../model/use-share-cluster-news-action'

interface ClusterDetailHeaderProps {
  cluster: ClusterDetail
}

function isAllowedUrl(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('http://')
}

export default function ClusterDetailHeader({ cluster }: ClusterDetailHeaderProps) {
  const navigate = useNavigate()
  const { handleShareNews, isPending } = useShareClusterNewsAction(cluster.clusterId)

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/news'))}
          className="inline-flex cursor-pointer items-center gap-1 text-sm text-wefin-subtle hover:text-wefin-text"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </button>
        <button
          type="button"
          onClick={handleShareNews}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-full bg-wefin-mint px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-wefin-mint/50 disabled:text-white/70"
        >
          <Share2 className="h-3.5 w-3.5" />
          채팅방 공유
        </button>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold leading-tight text-wefin-text">{cluster.title}</h1>

      {/* Time */}
      <p className="mt-2 text-xs text-wefin-subtle">{getTimeAgo(cluster.publishedAt)}</p>

      {/* Lead summary */}
      <p className="mt-5 text-[15px] leading-relaxed text-wefin-text">{cluster.summary}</p>

      {/* AI Sources */}
      {cluster.sources.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-wefin-text">
            <span className="text-wefin-mint">✦</span> AI 요약 출처
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {cluster.sources.map((src) => {
              const safe = isAllowedUrl(src.url)
              return (
                <a
                  key={src.articleId}
                  {...(safe
                    ? { href: src.url, target: '_blank', rel: 'noopener noreferrer' }
                    : { 'aria-disabled': true, tabIndex: -1 })}
                  className={`flex w-[200px] shrink-0 flex-col gap-2.5 rounded-2xl border border-gray-100 p-4 transition-colors ${safe ? 'hover:bg-gray-50' : 'cursor-not-allowed opacity-50'}`}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs text-wefin-subtle">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: '#24a8ab' }}
                    >
                      {src.publisherName.charAt(0).toUpperCase()}
                    </span>
                    {src.publisherName}
                  </span>
                  <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-wefin-text">
                    {src.title}
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* Thumbnail */}
      {cluster.thumbnailUrl && (
        <div className="mt-6 overflow-hidden rounded-2xl">
          <img src={cluster.thumbnailUrl} alt={cluster.title} className="w-full object-cover" />
        </div>
      )}
    </div>
  )
}
