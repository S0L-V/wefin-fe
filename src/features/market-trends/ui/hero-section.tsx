import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useWefiniChatStore } from '@/features/ai-chat/model/use-wefini-chat-store'
import { getTimeAgo } from '@/features/news-feed/lib/get-time-ago'
import { usePopularNewsQuery } from '@/features/news-feed/model/use-popular-news-query'

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
      className="relative overflow-hidden rounded-2xl sm:rounded-[28px] [--hero-cols:1fr] md:[--hero-cols:1.4fr_1fr]"
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
        className="relative z-0 grid min-h-[280px] gap-6 p-5 sm:min-h-[420px] sm:gap-9 sm:p-9"
        style={{
          gridTemplateColumns: 'var(--hero-cols, 1fr)',
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
              style={{ fontSize: 'clamp(22px, 3.2vw, 46px)' }}
            >
              {heroCard.headline}
            </h1>
            <p
              className="text-[13px] leading-relaxed sm:text-[15.5px]"
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

        {/* Right side — 거래대금 순위 (모바일에서 숨김) */}
        <div className="hidden md:flex">
          <HeroRanking />
        </div>
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
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => {
          if (clusterId != null) navigate(`/news/${clusterId}`)
        }}
        disabled={clusterId == null}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[13px] font-semibold text-[#053e38] transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50 sm:px-5 sm:py-2.5 sm:text-[14px]"
      >
        기사 전문 보기
        <ArrowRight size={16} />
      </button>
      <button
        type="button"
        onClick={openChat}
        className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.97] sm:px-5 sm:py-2.5 sm:text-[14px]"
        style={{ borderColor: 'rgba(255,255,255,0.4)', background: 'transparent' }}
      >
        AI에게 더 물어보기
      </button>
    </div>
  )
}

function HeroRanking() {
  const navigate = useNavigate()
  const { data: items, isLoading } = usePopularNewsQuery(5)

  return (
    <div className="flex flex-col self-stretch">
      <div className="mb-4">
        <h2
          className="text-[15px] font-extrabold uppercase tracking-widest text-white"
          style={{ textShadow: '0 0 20px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.15)' }}
        >
          인기 뉴스 TOP
        </h2>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-[13px] font-semibold text-white/60">준비 중</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-1.5">
          {items.map((item, idx) => (
            <button
              key={item.clusterId}
              type="button"
              onClick={() => navigate(`/news/${item.clusterId}`)}
              className="group relative overflow-hidden rounded-2xl px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
              style={{
                background: idx === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.22)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  idx === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`font-num shrink-0 text-[22px] font-black leading-none ${
                    idx < 3 ? 'text-white' : 'text-white/30'
                  }`}
                  style={
                    idx < 3
                      ? { textShadow: '0 0 16px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.2)' }
                      : undefined
                  }
                >
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-[15px] leading-snug ${
                      idx === 0 ? 'font-bold text-white' : 'font-semibold text-white/90'
                    }`}
                    style={{ textShadow: '0 1px 6px rgba(0,0,0,0.2)' }}
                  >
                    {item.title}
                  </p>
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-white/0 transition-colors duration-300 group-hover:text-white/50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
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
