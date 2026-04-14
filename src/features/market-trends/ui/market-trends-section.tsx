import { BookOpen, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { useLoginDialogStore } from '@/features/auth-dialog/model/use-login-dialog-store'
import SourceBadge from '@/shared/ui/source-badge'

import type { SourceCluster } from '../api/fetch-market-trends-overview'
import { useMarketTrendsOverviewQuery } from '../model/use-market-trends-overview-query'
import ClusterSourceModal from './cluster-source-modal'
import InsightCardList from './insight-card-list'
import MarketSnapshotStrip from './market-snapshot-strip'

function MarketTrendsSection() {
  const { data, isLoading, isError } = useMarketTrendsOverviewQuery()

  if (isLoading) return <SectionSkeleton />
  if (isError || !data) return <SectionError />

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
            title={data.title}
            summary={data.summary}
            articleCount={data.sourceArticleCount}
            sourceClusters={data.sourceClusters}
          />
          <InsightCardList cards={data.insightCards} sourceClusters={data.sourceClusters} />
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
  title: string | null
  summary: string | null
  articleCount: number
  sourceClusters: SourceCluster[]
}

function SummaryBlock({ title, summary, articleCount, sourceClusters }: SummaryBlockProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  // 클러스터 제목의 첫 글자를 이니셜로 사용 (언론사가 아닌 클러스터 주제 단위 식별)
  const badgeSources = sourceClusters.slice(0, 2).map((c) => ({ publisherName: c.title }))

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <BookOpen size={16} className="text-wefin-mint" />
        <h3 className="text-sm font-bold text-wefin-text">시장 개요</h3>
      </div>
      <div className="mb-3">
        <PersonalizedTrendButton />
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
        {title && <p className="text-[13px] font-semibold text-wefin-text">{title}</p>}
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

function PersonalizedTrendButton() {
  const openLogin = useLoginDialogStore((s) => s.openLogin)

  const handleClick = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      openLogin()
      return
    }
    // TODO: 로그인 사용자 맞춤 동향 분석 연동
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-wefin-mint/20 bg-gradient-to-r from-wefin-mint/10 to-blue-500/10 px-4 py-3 transition-colors hover:from-wefin-mint/20 hover:to-blue-500/20"
    >
      <Sparkles size={16} className="text-wefin-mint transition-transform group-hover:scale-110" />
      <span className="text-sm font-bold text-wefin-text">
        내 관심 분야 · 종목 맞춤 동향 분석하기
      </span>
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
  const d = new Date(date)
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
