import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import HighlightedText from '@/shared/ui/highlighted-text'
import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

import type { RecommendedCard } from '../api/fetch-recommended-news'
import {
  useRecommendedNewsQuery,
  useRefreshRecommendedNews
} from '../model/use-recommended-news-query'

export default function RecommendedNewsSection() {
  const userId = useAuthUserId()
  const { data, isLoading, isError } = useRecommendedNewsQuery(Boolean(userId))
  const refreshMutation = useRefreshRecommendedNews()

  if (!userId) return null
  if (isLoading) return <SectionSkeleton />
  if (isError || !data || data.cards.length === 0) return null

  const limitReached = data.refreshCount >= data.refreshLimit

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WefinLogoIcon size={18} className="text-wefin-mint-deep" />
          <h2 className="text-lg font-bold text-wefin-text">나를 위한 뉴스</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            if (limitReached) {
              toast('오늘 추천 횟수를 모두 사용했어요')
              return
            }
            if (!data.hasMore) {
              toast('더 이상 추천할 뉴스가 없어요')
              return
            }
            refreshMutation.mutate(undefined, {
              onSuccess: (newData) => {
                if (!newData.hasMore) {
                  toast('더 이상 추천할 뉴스가 없어요')
                }
              }
            })
          }}
          disabled={refreshMutation.isPending}
          className="flex items-center gap-1.5 rounded-full bg-wefin-bg px-3 py-1.5 text-xs font-semibold text-wefin-text transition-all hover:bg-wefin-mint-soft hover:text-wefin-mint-deep disabled:opacity-60"
        >
          <WefinLogoIcon
            size={13}
            className={
              refreshMutation.isPending ? 'animate-[spinPause_2s_ease-in-out_infinite]' : ''
            }
          />
          다른 뉴스 보기
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {data.cards.map((card, index) => (
          <RecommendedCardItem key={`${card.cardType}-${card.interestCode}-${index}`} card={card} />
        ))}
      </div>
    </div>
  )
}

function RecommendedCardItem({ card }: { card: RecommendedCard }) {
  const reasons = card.reasons.map((r) => r.label).filter(Boolean)

  return (
    <div className="border-l-[3px] border-wefin-mint-deep/30 py-1 pl-5">
      <h3 className="mb-2 text-base font-bold text-wefin-text">{card.title}</h3>
      <p className="text-[14px] font-medium leading-7 text-wefin-text">
        <HighlightedText text={card.summary} />
      </p>

      {reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {reasons.map((reason, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-wefin-mint-soft/50 px-3 py-1 text-xs font-semibold text-wefin-mint-deep"
            >
              {reason}
            </span>
          ))}
        </div>
      )}

      {card.linkedCluster && (
        <Link
          to={`/news/${card.linkedCluster.clusterId}`}
          className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-wefin-mint-deep transition-colors hover:underline hover:underline-offset-4"
        >
          {card.linkedCluster.title}
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded bg-gray-100" />
        <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-wefin-bg/60" />
        ))}
      </div>
    </div>
  )
}
