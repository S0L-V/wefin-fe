import { useQueryClient } from '@tanstack/react-query'
import { BookOpen, RefreshCw, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useLoginDialogStore } from '@/features/auth-dialog/model/use-login-dialog-store'
import SourceBadge from '@/shared/ui/source-badge'

import type {
  MarketTrendsOverview,
  PersonalizationMode,
  SourceCluster
} from '../api/fetch-market-trends-overview'
import { useMarketTrendsOverviewQuery } from '../model/use-market-trends-overview-query'
import { usePersonalizedMarketTrendsQuery } from '../model/use-personalized-market-trends-query'
import ClusterSourceModal from './cluster-source-modal'
import InsightCardList from './insight-card-list'
import MarketSnapshotStrip from './market-snapshot-strip'

/** 오늘 날짜(KST) 기반 localStorage 키 — 자정 넘어가면 자동으로 새 키가 되어 fresh */
function personalizedToggleKey() {
  const now = new Date()
  // KST 기준 yyyy-mm-dd
  const kstNow = new Date(now.getTime() + (now.getTimezoneOffset() + 9 * 60) * 60 * 1000)
  return `market-trends:personalized-on:${kstNow.toISOString().slice(0, 10)}`
}

function readPersistedToggle(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(personalizedToggleKey()) === '1'
}

function writePersistedToggle(on: boolean) {
  try {
    if (on) window.localStorage.setItem(personalizedToggleKey(), '1')
    else window.localStorage.removeItem(personalizedToggleKey())
  } catch {
    /* localStorage 비활성/quota 초과는 토글 UX 보조용이라 무시 */
  }
}

/** 백엔드 캐시 TTL과 동일 — 30분 안에 재요청 시 알림 */
const PERSONALIZED_REFRESH_INTERVAL_MS = 30 * 60 * 1000

function MarketTrendsSection() {
  const { data, isLoading, isError } = useMarketTrendsOverviewQuery()
  const queryClient = useQueryClient()
  // 로그인된 사용자가 오늘 한 번이라도 토글 ON했다면 새로고침 후에도 자동 ON.
  // 백엔드 캐시(V32)가 살아있으므로 personalized 호출은 즉시 DB hit으로 반환됨
  const [personalizedOn, setPersonalizedOn] = useState<boolean>(() => readPersistedToggle())
  const personalizedQuery = usePersonalizedMarketTrendsQuery(personalizedOn)

  if (isLoading) return <SectionSkeleton />
  if (isError || !data) return <SectionError />

  // 버튼이 켜졌고 personalized 응답이 도착했으면 그 응답을 화면 소스로 사용. 그 외엔 overview
  const display: MarketTrendsOverview =
    personalizedOn && personalizedQuery.data ? personalizedQuery.data : data
  const personalizedMode = personalizedQuery.data?.mode
  const isPersonalizedActive = personalizedOn && personalizedMode === 'MATCHED'
  const isActionBriefing = personalizedOn && personalizedMode === 'ACTION_BRIEFING'
  const isPersonalizedFallback = personalizedOn && personalizedMode === 'OVERVIEW_FALLBACK'

  function handleAnalyzeClick() {
    // 분석 결과가 이미 있는 경우: 30분 안이면 알림, 30분 지났으면 갱신
    if (personalizedQuery.data?.updatedAt) {
      const lastAt = new Date(personalizedQuery.data.updatedAt).getTime()
      const elapsedMs = Date.now() - lastAt
      if (elapsedMs < PERSONALIZED_REFRESH_INTERVAL_MS) {
        const remainingMin = Math.ceil((PERSONALIZED_REFRESH_INTERVAL_MS - elapsedMs) / 60_000)
        window.alert(
          `방금 분석한 결과가 있어요. ${remainingMin}분 후에 새 분석을 받아볼 수 있어요.`
        )
        return
      }
      // TTL 경과 → 백엔드 캐시도 stale 처리해 새 AI 호출 유도
      queryClient.invalidateQueries({ queryKey: ['market-trends', 'personalized'] })
      personalizedQuery.refetch()
      return
    }

    // 처음 분석: 토글 ON + 영속화
    setPersonalizedOn(true)
    writePersistedToggle(true)
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <header className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-lg font-bold text-wefin-text">오늘 시장 한눈에 보기</h2>
        {data.trendDate && (
          <span className="text-sm text-wefin-subtle">{formatTrendDate(data.trendDate)}</span>
        )}
        {data.updatedAt && (
          <span className="ml-auto text-xs text-wefin-subtle">
            업데이트 {formatUpdatedAt(data.updatedAt)}
          </span>
        )}
      </header>

      <MarketSnapshotStrip snapshots={data.marketSnapshots} />

      {data.generated ? (
        <div className="mt-6 flex flex-col gap-5">
          <SummaryBlock
            summary={data.summary}
            articleCount={data.sourceArticleCount}
            sourceClusters={data.sourceClusters}
            personalizedActive={isPersonalizedActive || isActionBriefing}
            personalizedFallback={isPersonalizedFallback}
            personalizedLoading={personalizedQuery.isFetching}
            personalizedError={personalizedQuery.isError}
            onAnalyzeClick={handleAnalyzeClick}
          />
          {(isPersonalizedActive || isActionBriefing) && personalizedQuery.data && (
            <PersonalizedSummaryBlock
              mode={personalizedMode!}
              summary={personalizedQuery.data.summary}
              articleCount={personalizedQuery.data.sourceArticleCount}
              sourceClusters={personalizedQuery.data.sourceClusters}
            />
          )}
          <InsightCardList cards={display.insightCards} sourceClusters={display.sourceClusters} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-wefin-subtle">
          오늘의 동향이 아직 준비 중입니다. 잠시 후 다시 확인해주세요.
        </p>
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
}

function SummaryBlock({
  summary,
  articleCount,
  sourceClusters,
  personalizedActive,
  personalizedFallback,
  personalizedLoading,
  personalizedError,
  onAnalyzeClick
}: SummaryBlockProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const badgeSources = sourceClusters.slice(0, 2).map((c) => ({ publisherName: c.title }))

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <BookOpen size={16} className="text-wefin-mint" />
        <h3 className="text-sm font-bold text-wefin-text">시장 개요</h3>
      </div>
      <div className="mb-3">
        <PersonalizedTrendButton
          analyzed={personalizedActive}
          loading={personalizedLoading}
          onClick={onAnalyzeClick}
        />
      </div>
      {personalizedFallback && !personalizedLoading && (
        <p className="mb-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
          이번에는 맞춤 분석을 만들지 못했어요. 일반 시황을 보여드립니다.
        </p>
      )}
      {personalizedError && !personalizedLoading && (
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">
          맞춤 분석을 가져오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
        {summary && (
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-wefin-text">
            {summary}
          </p>
        )}
        {sourceClusters.length > 0 && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer self-end transition-opacity hover:opacity-80"
          >
            <SourceBadge sourceCount={articleCount} sources={badgeSources} size="sm" />
          </button>
        )}
      </div>
      {isModalOpen && (
        <ClusterSourceModal
          articleCount={articleCount}
          clusters={sourceClusters}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

type PersonalizedSummaryBlockProps = {
  mode: PersonalizationMode
  summary: string | null
  articleCount: number
  sourceClusters: SourceCluster[]
}

function PersonalizedSummaryBlock({
  mode,
  summary,
  articleCount,
  sourceClusters
}: PersonalizedSummaryBlockProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const badgeSources = sourceClusters.slice(0, 2).map((c) => ({ publisherName: c.title }))
  // MATCHED: 사용자 관심사 기반 맞춤 분석 / ACTION_BRIEFING: 매칭 없을 때의 일반 시장 액션 분석
  const headerLabel = mode === 'MATCHED' ? '내 관심 종목 맞춤 동향' : '오늘의 시장 액션'

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl border border-wefin-mint/30 bg-gradient-to-br from-wefin-mint/10 to-blue-500/5 p-4">
        <div className="flex items-center gap-1.5 text-sm font-bold text-wefin-text">
          <Sparkles size={16} className="text-wefin-mint" />
          {headerLabel}
        </div>
        {summary && (
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-wefin-text">
            {summary}
          </p>
        )}
        {sourceClusters.length > 0 && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer self-end transition-opacity hover:opacity-80"
          >
            <SourceBadge sourceCount={articleCount} sources={badgeSources} size="sm" />
          </button>
        )}
      </div>
      {isModalOpen && (
        <ClusterSourceModal
          articleCount={articleCount}
          clusters={sourceClusters}
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

  const label = analyzed ? '맞춤 분석 새로고침' : '내 관심 분야 · 종목 맞춤 동향 분석하기'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-wefin-mint/20 bg-gradient-to-r from-wefin-mint/10 to-blue-500/10 px-4 py-3 transition-colors hover:from-wefin-mint/20 hover:to-blue-500/20 disabled:opacity-60"
    >
      {loading ? (
        <RefreshCw size={16} className="animate-spin text-wefin-mint" />
      ) : (
        <Sparkles
          size={16}
          className="text-wefin-mint transition-transform group-hover:scale-110"
        />
      )}
      <span className="text-sm font-bold text-wefin-text">{loading ? '분석 중...' : label}</span>
    </button>
  )
}

function formatUpdatedAt(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTrendDate(date: string) {
  // ISO date-only(YYYY-MM-DD)는 new Date()로 파싱하면 UTC 기준 00:00로 해석돼
  // KST(UTC+9) 환경에서 하루 밀릴 수 있어 수동 파싱한다
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const d = isoDateOnly
    ? new Date(Number(isoDateOnly[1]), Number(isoDateOnly[2]) - 1, Number(isoDateOnly[3]))
    : new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function SectionSkeleton() {
  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <div className="h-6 w-56 animate-pulse rounded bg-wefin-line" />
      <div className="mt-6 h-24 animate-pulse rounded-2xl bg-wefin-line/60" />
    </div>
  )
}

function SectionError() {
  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h2 className="text-lg font-bold text-wefin-text">오늘 시장 한눈에 보기</h2>
      <p className="mt-4 text-sm text-wefin-subtle">동향을 불러오지 못했습니다.</p>
    </div>
  )
}

export default MarketTrendsSection
