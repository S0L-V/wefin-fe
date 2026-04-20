import { useQueryClient } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useLoginDialogStore } from '@/features/auth-dialog/model/use-login-dialog-store'
import HighlightedText from '@/shared/ui/highlighted-text'
import SourceBadge from '@/shared/ui/source-badge'
import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

import type {
  MarketTrendsOverview,
  PersonalizationMode,
  SourceCluster
} from '../api/fetch-market-trends-overview'
import { useMarketTrendsOverviewQuery } from '../model/use-market-trends-overview-query'
import {
  usePersonalizedMarketTrendsCachedQuery,
  usePersonalizedMarketTrendsQuery
} from '../model/use-personalized-market-trends-query'
import ClusterSourceModal from './cluster-source-modal'
import InsightCardList from './insight-card-list'
import { MarketOverviewGrid } from './market-overview-card'

/** 백엔드 캐시 TTL과 동일 — 30분 안에 재요청 시 알림 */
const PERSONALIZED_REFRESH_INTERVAL_MS = 30 * 60 * 1000

function MarketTrendsSection() {
  const { data, isLoading, isError } = useMarketTrendsOverviewQuery()
  const queryClient = useQueryClient()
  const userId = useAuthUserId()

  // 페이지 진입 시 TTL 내 캐시만 조회 — AI 호출을 유발하지 않아 자동 호출이 안전하다
  const cachedQuery = usePersonalizedMarketTrendsCachedQuery(Boolean(userId))
  // 버튼 클릭 시점에만 AI 재생성이 가능한 full 엔드포인트 호출
  const [freshRequested, setFreshRequested] = useState<boolean>(false)
  const personalizedQuery = usePersonalizedMarketTrendsQuery(freshRequested)

  if (isLoading) return <SectionSkeleton />
  if (isError || !data) return <SectionError />

  // fresh 요청이 있으면 그 응답을 우선, 없으면 캐시 응답을 사용. 둘 다 없으면 overview
  const personalizedData = personalizedQuery.data ?? cachedQuery.data ?? null
  const display: MarketTrendsOverview = personalizedData ?? data
  const personalizedMode = personalizedData?.mode
  const isPersonalizedActive = personalizedMode === 'MATCHED'
  const isActionBriefing = personalizedMode === 'ACTION_BRIEFING'
  const isPersonalizedFallback = freshRequested && personalizedMode === 'OVERVIEW_FALLBACK'

  function handleAnalyzeClick() {
    // 분석 결과가 이미 있는 경우: 30분 안이면 알림, 30분 지났으면 갱신
    const lastUpdatedAt = personalizedData?.updatedAt
    if (lastUpdatedAt) {
      const lastAt = new Date(lastUpdatedAt).getTime()
      const elapsedMs = Date.now() - lastAt
      if (elapsedMs < PERSONALIZED_REFRESH_INTERVAL_MS) {
        const remainingMin = Math.ceil((PERSONALIZED_REFRESH_INTERVAL_MS - elapsedMs) / 60_000)
        toast('방금 분석한 결과가 있어요', {
          description: `${remainingMin}분 후에 새 분석을 받아볼 수 있어요`
        })
        return
      }
    }

    // TTL 경과 또는 캐시 없음 → 서버에 AI 재생성을 요청하도록 full 엔드포인트 트리거
    // exact: true — prefix 매칭으로 cached 쿼리(['market-trends','personalized','cached'])까지 무효화되지 않도록 제한
    queryClient.invalidateQueries({ queryKey: ['market-trends', 'personalized'], exact: true })
    if (freshRequested) {
      personalizedQuery.refetch()
    } else {
      setFreshRequested(true)
    }
  }

  return (
    <div>
      <MarketOverviewGrid />

      {data.generated ? (
        <div className="flex flex-col gap-5 p-[var(--card-pad)]">
          <SummaryBlock
            summary={data.summary}
            articleCount={data.sourceArticleCount}
            sourceClusters={data.sourceClusters}
            personalizedActive={isPersonalizedActive || isActionBriefing}
            personalizedFallback={isPersonalizedFallback}
            personalizedLoading={personalizedQuery.isFetching}
            personalizedError={personalizedQuery.isError}
            onAnalyzeClick={handleAnalyzeClick}
            personalizedSummary={personalizedData?.summary ?? null}
            personalizedArticleCount={personalizedData?.sourceArticleCount ?? 0}
            personalizedSourceClusters={personalizedData?.sourceClusters ?? []}
            personalizedMode={personalizedMode ?? null}
          />
          <InsightCardList cards={display.insightCards} sourceClusters={display.sourceClusters} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-[var(--card-pad)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WefinLogoIcon size={18} className="text-wefin-mint-deep" />
              <h3 className="text-sm font-bold text-wefin-text">오늘의 브리핑</h3>
            </div>
            <PersonalizedTrendButton
              analyzed={false}
              loading={personalizedQuery.isFetching}
              onClick={handleAnalyzeClick}
            />
          </div>
          <p className="text-sm text-wefin-subtle">
            AI 브리핑이 아직 생성되지 않았습니다. 맞춤 분석을 눌러 직접 생성하거나, 잠시 후 다시
            확인해주세요.
          </p>
        </div>
      )}
    </div>
  )
}

type SummaryBlockProps = {
  summary: string | null
  articleCount: number
  sourceClusters: SourceCluster[]
  personalizedActive: boolean
  personalizedFallback: boolean
  personalizedLoading: boolean
  personalizedError: boolean
  onAnalyzeClick: () => void
  personalizedSummary: string | null
  personalizedArticleCount: number
  personalizedSourceClusters: SourceCluster[]
  personalizedMode: PersonalizationMode | null
}

function SummaryBlock({
  summary,
  articleCount,
  sourceClusters,
  personalizedActive,
  personalizedFallback,
  personalizedLoading,
  personalizedError,
  onAnalyzeClick,
  personalizedSummary,
  personalizedArticleCount,
  personalizedSourceClusters,
  personalizedMode
}: SummaryBlockProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState<'general' | 'personalized'>('general')
  const hasPersonalized = personalizedActive && !!personalizedSummary
  const badgeSources = sourceClusters.slice(0, 2).map((c) => ({ publisherName: c.title }))
  const pBadgeSources = personalizedSourceClusters
    .slice(0, 2)
    .map((c) => ({ publisherName: c.title }))

  const [prevHasPersonalized, setPrevHasPersonalized] = useState(false)
  if (prevHasPersonalized !== hasPersonalized) {
    setPrevHasPersonalized(hasPersonalized)
    if (hasPersonalized) setActiveSlide('personalized')
  }

  const showingPersonalized = hasPersonalized && activeSlide === 'personalized'

  const modeLabel =
    personalizedMode === 'MATCHED'
      ? '내 관심 종목 맞춤 동향'
      : personalizedMode === 'ACTION_BRIEFING'
        ? '시장 액션 브리핑'
        : '맞춤 분석'

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WefinLogoIcon size={18} className="text-wefin-mint-deep" />
          <h3 className="text-sm font-bold text-wefin-text">오늘의 브리핑</h3>
        </div>
        <PersonalizedTrendButton
          analyzed={personalizedActive}
          loading={personalizedLoading}
          onClick={onAnalyzeClick}
        />
      </div>
      {personalizedFallback && !personalizedLoading && (
        <p className="mb-3 rounded-xl bg-wefin-amber-soft px-4 py-2.5 text-xs text-wefin-amber-text">
          이번에는 맞춤 분석을 만들지 못했어요. 일반 시황을 보여드립니다.
        </p>
      )}
      {personalizedError && !personalizedLoading && (
        <p className="mb-3 rounded-xl bg-wefin-red-soft px-4 py-2.5 text-xs text-red-600">
          맞춤 분석을 가져오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}

      {hasPersonalized && (
        <div className="mb-4 flex gap-4 border-b border-wefin-line/50">
          {(
            [
              ['general', '시장 개요'],
              ['personalized', modeLabel]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSlide(key)}
              className={`origin-center relative pb-2 text-sm font-semibold transition-all ${
                activeSlide === key
                  ? 'scale-110 text-wefin-mint-deep after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-wefin-mint-deep'
                  : 'text-wefin-subtle hover:scale-105 hover:text-wefin-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <SummaryContent
        summary={showingPersonalized ? personalizedSummary : summary}
        articleCount={showingPersonalized ? personalizedArticleCount : articleCount}
        sources={showingPersonalized ? pBadgeSources : badgeSources}
        sourceClusters={showingPersonalized ? personalizedSourceClusters : sourceClusters}
        onSourceClick={() => setIsModalOpen(true)}
      />

      {isModalOpen && (
        <ClusterSourceModal
          articleCount={showingPersonalized ? personalizedArticleCount : articleCount}
          clusters={showingPersonalized ? personalizedSourceClusters : sourceClusters}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

type PersonalizedTrendButtonProps = {
  /** 이미 분석 결과가 화면에 노출 중인지. true면 라벨이 갱신 톤으로 바뀜 */
  analyzed: boolean
  loading: boolean
  onClick: () => void
}

function PersonalizedTrendButton({ analyzed, loading, onClick }: PersonalizedTrendButtonProps) {
  const userId = useAuthUserId()
  const openLogin = useLoginDialogStore((s) => s.openLogin)

  const handleClick = () => {
    if (!userId) {
      openLogin()
      return
    }
    onClick()
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="group/btn relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-[#1a8a8c] to-[#0f6b6d] px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-300 hover:from-[#24a8ab] hover:to-[#1a8a8c] hover:shadow-[0_4px_20px_rgba(36,168,171,0.3)] active:scale-[0.97] disabled:opacity-60"
      >
        {loading ? (
          <WefinLogoIcon
            size={15}
            className="relative z-10 animate-[spinPause_2s_ease-in-out_infinite]"
          />
        ) : (
          <WefinLogoIcon
            size={15}
            className="relative z-10 transition-transform duration-300 group-hover/btn:scale-110"
          />
        )}
        <span className="relative z-10">
          {loading ? '분석 중...' : analyzed ? '새로고침' : '맞춤 분석'}
        </span>
      </button>
      <span className="group/info relative inline-flex h-4 w-4 cursor-default items-center justify-center rounded-full text-wefin-subtle transition-colors hover:text-wefin-mint-deep">
        <Info size={14} />
        <span className="pointer-events-none invisible absolute right-0 top-full z-20 mt-2 w-[220px] rounded-xl bg-gray-900 px-3 py-2.5 text-xs leading-relaxed font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/info:visible group-hover/info:opacity-100">
          내 관심 분야와 보유 종목을 기반으로 AI가 시장 동향을 분석해요
        </span>
      </span>
    </div>
  )
}

function SummaryContent({
  summary,
  articleCount,
  sources,
  sourceClusters,
  onSourceClick
}: {
  summary: string | null
  articleCount: number
  sources: { publisherName: string }[]
  sourceClusters: SourceCluster[]
  onSourceClick: () => void
}) {
  return (
    <div className="border-l-[3px] border-wefin-mint-deep/30 pl-5 py-1">
      {summary && (
        <div className="whitespace-pre-line text-[14px] leading-7 text-wefin-text">
          {(() => {
            const firstBreak = summary.indexOf('\n')
            if (firstBreak === -1)
              return (
                <p className="font-semibold">
                  <HighlightedText text={summary} />
                </p>
              )
            return (
              <>
                <p className="font-semibold">
                  <HighlightedText text={summary.slice(0, firstBreak)} />
                </p>
                <p className="mt-2">
                  <HighlightedText text={summary.slice(firstBreak + 1)} />
                </p>
              </>
            )
          })()}
        </div>
      )}
      {sourceClusters.length > 0 && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onSourceClick}
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <SourceBadge sourceCount={articleCount} sources={sources} size="sm" />
          </button>
        </div>
      )}
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div>
      <div className="h-6 w-56 animate-pulse rounded bg-wefin-line" />
      <div className="mt-6 h-24 animate-pulse rounded-2xl bg-wefin-line/60" />
    </div>
  )
}

function SectionError() {
  return (
    <div>
      <h2 className="text-lg font-bold text-wefin-text">오늘 시장 한눈에 보기</h2>
      <p className="mt-4 text-sm text-wefin-subtle">동향을 불러오지 못했습니다.</p>
    </div>
  )
}

export default MarketTrendsSection
