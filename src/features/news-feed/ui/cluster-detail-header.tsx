import { ArrowLeft, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { ClusterDetail } from '../api/fetch-cluster-detail'

interface ClusterDetailHeaderProps {
  cluster: ClusterDetail
}

function getTimeAgo(dateStr: string): string {
  const published = new Date(dateStr).getTime()
  if (Number.isNaN(published)) return '알 수 없음'

  const diffMs = Math.max(0, Date.now() - published)

  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`

  const diffHours = Math.floor(diffMs / 3_600_000)
  if (diffHours < 24) return `${diffHours}시간 전`

  const diffDays = Math.floor(diffMs / 86_400_000)
  return `${diffDays}일 전`
}

export default function ClusterDetailHeader({ cluster }: ClusterDetailHeaderProps) {
  const navigate = useNavigate()

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex cursor-pointer items-center gap-1 text-sm text-wefin-subtle hover:text-wefin-text"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </button>
        <button
          disabled
          className="inline-flex items-center gap-1.5 rounded-full bg-wefin-mint/50 px-4 py-2 text-sm font-medium text-white/70 cursor-not-allowed"
          title="준비 중"
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
            {cluster.sources.map((src) => (
              <a
                key={src.articleId}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-[200px] shrink-0 flex-col gap-2.5 rounded-2xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
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
            ))}
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
