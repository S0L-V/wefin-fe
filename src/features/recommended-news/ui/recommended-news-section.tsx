import { ChevronRight, Lightbulb, Link2, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'

import type { RecommendedCard } from '../api/fetch-recommended-news'
import {
  useRecommendedNewsQuery,
  useRefreshRecommendedNews
} from '../model/use-recommended-news-query'

const BORDER_COLORS = ['border-[#3db9b9]/20', 'border-blue-500/20', 'border-green-500/20']
const BG_COLORS = ['bg-[#3db9b9]', 'bg-blue-500', 'bg-green-500']
const TEXT_COLORS = ['text-[#3db9b9]', 'text-blue-500', 'text-green-500']

export default function RecommendedNewsSection() {
  const userId = useAuthUserId()
  const { data, isLoading, isError } = useRecommendedNewsQuery(Boolean(userId))
  const refreshMutation = useRefreshRecommendedNews()

  if (!userId) return null
  if (isLoading) return <SectionSkeleton />
  if (isError || !data || data.cards.length === 0) return null

  const limitReached = data.refreshCount >= data.refreshLimit
  const canRefresh = data.hasMore && !limitReached

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-[#3db9b9]" />
          <h2 className="text-lg font-bold text-wefin-text">나를 위한 뉴스</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-wefin-subtle">
            {data.refreshCount} / {data.refreshLimit}회
          </span>
          {canRefresh && (
            <button
              type="button"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="flex items-center gap-1 text-xs text-wefin-subtle transition-colors hover:text-wefin-mint"
            >
              <RefreshCw size={14} className={refreshMutation.isPending ? 'animate-spin' : ''} />
              <span>다른 뉴스 보기</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {data.cards.map((card, index) => (
          <RecommendedCard
            key={`${card.cardType}-${card.interestCode}`}
            card={card}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

function RecommendedCard({ card, index }: { card: RecommendedCard; index: number }) {
  const colorIdx = index % 3
  const mainReason = card.reasons
    .map((r) => r.label)
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${BORDER_COLORS[colorIdx]}`}>
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-[16px] font-bold text-wefin-text">{card.title}</h3>
        </div>
        <p className="text-[14px] font-medium leading-relaxed text-gray-700">{card.summary}</p>
      </div>

      {mainReason && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-wefin-line bg-wefin-bg p-3.5">
          <Lightbulb size={16} className={`mt-0.5 shrink-0 ${TEXT_COLORS[colorIdx]}`} />
          <p className="text-[13px] font-bold leading-relaxed text-gray-600">{mainReason}</p>
        </div>
      )}

      {card.linkedCluster && (
        <Link
          to={`/news/${card.linkedCluster.clusterId}`}
          className="group flex items-center gap-3 rounded-xl border border-wefin-line bg-white px-4 py-3 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${BG_COLORS[colorIdx]}`}
          >
            <Link2 size={14} className="text-white" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="mb-0.5 text-[11px] font-bold text-gray-400">이 뉴스를 읽어보세요</span>
            <span className="line-clamp-1 text-[14px] font-bold text-gray-800 transition-colors">
              {card.linkedCluster.title}
            </span>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600" />
        </Link>
      )}
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded bg-gray-100" />
        <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-50" />
        ))}
      </div>
    </div>
  )
}
