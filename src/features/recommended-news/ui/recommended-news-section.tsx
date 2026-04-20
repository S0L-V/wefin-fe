import { Sparkles } from 'lucide-react'
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
  const heroCard = data.cards[0]
  const subCards = data.cards.slice(1, 4)

  function handleRefresh() {
    if (limitReached) {
      toast('오늘 추천 횟수를 모두 사용했어요')
      return
    }
    if (!data!.hasMore) {
      toast('더 이상 추천할 뉴스가 없어요')
      return
    }
    refreshMutation.mutate(undefined, {
      onSuccess: (newData) => {
        if (!newData.hasMore) toast('더 이상 추천할 뉴스가 없어요')
      }
    })
  }

  const reasons = heroCard.reasons.map((r) => r.label).filter(Boolean)

  return (
    <section className="card-base overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-dashed border-wefin-line bg-gradient-to-b from-wefin-mint-soft/30 to-transparent p-[var(--card-pad)]">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-wefin-mint-soft px-2.5 py-1 text-[11.5px] font-extrabold uppercase tracking-[0.1em] text-wefin-mint-deep">
            <Sparkles size={12} />
            나를 위한 뉴스
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-wefin-line bg-wefin-surface px-3 py-1.5 text-xs font-semibold text-wefin-text-2 transition-all hover:border-wefin-mint-100 hover:bg-wefin-mint-soft hover:text-wefin-mint-deep disabled:opacity-50"
          >
            <WefinLogoIcon
              size={13}
              className={
                refreshMutation.isPending ? 'animate-[spinPause_2s_ease-in-out_infinite]' : ''
              }
            />
            <span className="hidden sm:inline">다른 뉴스 보기</span>
          </button>
        </div>

        <div>
          <h3 className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
            {heroCard.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-wefin-text-2 sm:mt-2.5 sm:text-sm">
            <HighlightedText text={heroCard.summary} />
          </p>
          {reasons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-3.5 sm:gap-2">
              {reasons.map((reason, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border border-wefin-line bg-wefin-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-wefin-text-2 transition-colors hover:border-wefin-mint-100 hover:bg-wefin-mint-soft hover:text-wefin-mint-deep sm:gap-1.5 sm:px-3 sm:py-1 sm:text-[12.5px]"
                >
                  <span className="font-extrabold text-wefin-mint-600">#</span>
                  {reason}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {subCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {subCards.map((card, i) => (
            <SubCardItem
              key={`${card.cardType}-${card.interestCode}-${i}`}
              card={card}
              index={i}
              isLast={i === subCards.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function SubCardItem({
  card,
  index,
  isLast
}: {
  card: RecommendedCard
  index: number
  isLast: boolean
}) {
  const content = (
    <div
      className={`flex flex-col gap-2 p-4 transition-colors hover:bg-wefin-surface-2 sm:p-5 ${isLast ? '' : 'border-b border-wefin-line sm:border-b-0 sm:border-r'}`}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-wefin-mint-soft font-num text-xs font-extrabold text-wefin-mint-deep">
        {String(index + 1).padStart(2, '0')}
      </div>
      <h4 className="line-clamp-2 text-[14.5px] font-bold leading-snug">{card.title}</h4>
      <div className="flex items-center gap-2 text-xs text-wefin-subtle">
        {card.reasons[0]?.label && <span>{card.reasons[0].label}</span>}
      </div>
    </div>
  )

  if (card.linkedCluster) {
    return (
      <Link to={`/news/${card.linkedCluster.clusterId}`} className="cursor-pointer">
        {content}
      </Link>
    )
  }
  return content
}

function SectionSkeleton() {
  return (
    <div className="card-base overflow-hidden">
      <div className="space-y-3 p-7">
        <div className="h-5 w-32 animate-pulse rounded bg-wefin-surface-2" />
        <div className="h-7 w-2/3 animate-pulse rounded bg-wefin-surface-2" />
        <div className="h-4 w-full animate-pulse rounded bg-wefin-surface-2" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-wefin-surface-2" />
      </div>
      <div className="grid grid-cols-1 border-t border-wefin-line sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 p-5">
            <div className="h-7 w-7 animate-pulse rounded-lg bg-wefin-surface-2" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-wefin-surface-2" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-wefin-surface-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
