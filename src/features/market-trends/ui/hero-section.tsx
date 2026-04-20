import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useWefiniChatStore } from '@/features/ai-chat/model/use-wefini-chat-store'
import { getTimeAgo } from '@/features/news-feed/lib/get-time-ago'

import type { SourceCluster } from '../api/fetch-market-trends-overview'
import { useMarketTrendsOverviewQuery } from '../model/use-market-trends-overview-query'

function HeroSection() {
  const { data, isLoading } = useMarketTrendsOverviewQuery()

  if (isLoading) return <HeroSkeleton />
  if (!data?.generated) return null

  const { insightCards, summary, updatedAt, sourceClusters, sourceArticleCount } = data
  const heroCard = insightCards[0] ?? null

  if (!heroCard) {
    return summary ? <FallbackHero summary={summary} /> : null
  }

  const heroClusterId = heroCard.relatedClusterIds[0] ?? null

  return (
    <div
      className="relative overflow-hidden rounded-[28px]"
      style={{ boxShadow: 'var(--shadow-hero)' }}
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay"
        style={{
          opacity: 0.12,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '4px 4px'
        }}
      />

      <div
        className="relative z-0 grid min-h-[420px] gap-9 p-9"
        style={{
          gridTemplateColumns: '1.4fr 1fr',
          background:
            'linear-gradient(135deg, var(--color-wefin-mint-deep) 0%, var(--color-wefin-mint) 55%, var(--color-wefin-mint-300) 110%)'
        }}
      >
        {/* Left side */}
        <div className="flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-5">
            <LiveBadge updatedAt={updatedAt} />
            <h1
              className="font-extrabold leading-tight text-white"
              style={{ fontSize: 'clamp(32px, 3.2vw, 46px)' }}
            >
              {heroCard.headline}
            </h1>
            <p
              className="text-[15.5px] leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.88)' }}
            >
              {heroCard.body}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <HeroMeta
              sourceClusters={sourceClusters}
              updatedAt={updatedAt}
              articleCount={sourceArticleCount}
            />
            <HeroActions clusterId={heroClusterId} />
          </div>
        </div>

        {/* Right side — 거래대금 순위 */}
        <HeroRanking />
      </div>
    </div>
  )
}

function LiveBadge({ updatedAt }: { updatedAt: string | null }) {
  const timeLabel = updatedAt ? getTimeAgo(updatedAt) : ''
  return (
    <div
      className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium text-white"
      style={{ background: 'rgba(255,255,255,0.15)' }}
    >
      <span className="relative flex h-[7px] w-[7px]">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-white" />
      </span>
      AI 요약{timeLabel ? ` \u00B7 ${timeLabel} 기준` : ''} · 이 시각 주요 뉴스
    </div>
  )
}

function HeroMeta({
  sourceClusters,
  updatedAt,
  articleCount
}: {
  sourceClusters: SourceCluster[]
  updatedAt: string | null
  articleCount: number
}) {
  const sourceNames = sourceClusters
    .slice(0, 3)
    .map((c) => c.title)
    .join(', ')
  const timeAgo = updatedAt ? getTimeAgo(updatedAt) : ''

  const parts = [sourceNames, timeAgo, articleCount > 0 ? `기사 ${articleCount}건` : ''].filter(
    Boolean
  )

  if (parts.length === 0) return null

  return (
    <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.78)' }}>
      {parts.join(' · ')}
    </p>
  )
}

function HeroActions({ clusterId }: { clusterId: number | null }) {
  const navigate = useNavigate()
  const openChat = useWefiniChatStore((s) => s.open)

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => {
          if (clusterId != null) navigate(`/news/${clusterId}`)
        }}
        disabled={clusterId == null}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
        style={{ color: 'var(--color-wefin-mint-900)' }}
      >
        기사 전문 보기
        <ArrowRight size={16} />
      </button>
      <button
        type="button"
        onClick={openChat}
        className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.97]"
        style={{ borderColor: 'rgba(255,255,255,0.4)', background: 'transparent' }}
      >
        AI에게 더 물어보기
      </button>
    </div>
  )
}

function HeroRanking() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span
          className="font-num text-[12px] font-extrabold tracking-[0.12em] uppercase"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          인기 뉴스 TOP
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
          style={{ background: 'rgba(0,0,0,0.12)', color: 'rgba(255,255,255,0.85)' }}
        >
          실시간
        </span>
      </div>
      <div
        className="flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[18px] backdrop-blur-sm py-12"
        style={{
          background: 'rgba(0,0,0,0.12)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          준비 중
        </p>
        <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
          조회수 기반 뉴스 순위가 곧 제공됩니다
        </p>
      </div>
    </div>
  )
}

function FallbackHero({ summary }: { summary: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-9"
      style={{
        boxShadow: 'var(--shadow-hero)',
        background:
          'linear-gradient(135deg, var(--color-wefin-mint-deep) 0%, var(--color-wefin-mint) 55%, var(--color-wefin-mint-300) 110%)'
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay"
        style={{
          opacity: 0.12,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '4px 4px'
        }}
      />
      <div className="relative z-0">
        <LiveBadge updatedAt={null} />
        <p
          className="mt-5 text-[15.5px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.88)' }}
        >
          {summary}
        </p>
      </div>
    </div>
  )
}

function HeroSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] bg-wefin-line/40" style={{ minHeight: 420 }}>
      <div className="grid min-h-[420px] gap-9 p-9" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-5">
            <div className="h-8 w-64 rounded-full bg-wefin-line/60" />
            <div className="h-12 w-full rounded-xl bg-wefin-line/60" />
            <div className="h-12 w-4/5 rounded-xl bg-wefin-line/60" />
            <div className="h-16 w-full rounded-xl bg-wefin-line/40" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-36 rounded-xl bg-wefin-line/60" />
            <div className="h-10 w-44 rounded-xl bg-wefin-line/40" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-4 w-32 rounded bg-wefin-line/40" />
          <div className="flex-1 rounded-[18px] bg-wefin-line/30" />
        </div>
      </div>
    </div>
  )
}

export default HeroSection
