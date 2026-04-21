import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useWefiniChatStore } from '@/features/ai-chat/model/use-wefini-chat-store'
import type { ClusterItem } from '@/features/news-feed/api/fetch-news-clusters'
import { getTimeAgo } from '@/features/news-feed/lib/get-time-ago'
import { usePopularNewsQuery } from '@/features/news-feed/model/use-popular-news-query'

const ROTATE_INTERVAL_MS = 5000

function HeroSection() {
  const { data, isLoading } = usePopularNewsQuery(5)
  const items = data?.items ?? []
  const lastAggregatedAt = data?.lastAggregatedAt ?? null

  const [activeIndex, setActiveIndex] = useState(0)
  // 사용자가 특정 순위를 수동 선택하면 pin — 자동 회전 중단
  // (매 interval tick 마다 활성 순위가 바뀌어 사용자가 읽던 뉴스를 놓치는 문제 방지)
  const [isPinned, setIsPinned] = useState(false)

  // 자동 회전 — 아이템이 2개 이상이고 pin 이 아닐 때만. pin 이 true 로 바뀌면
  // cleanup 에서 clearInterval 이 실행돼 즉시 멈춤.
  useEffect(() => {
    if (items.length <= 1 || isPinned) return
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, ROTATE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [items.length, isPinned])

  function handleManualSelect(idx: number) {
    setActiveIndex(idx)
    setIsPinned(true)
  }

  if (isLoading) return <HeroSkeleton />
  if (items.length === 0) return null

  // items 가 줄어들어 activeIndex 가 범위 밖이면 안전하게 첫 아이템 사용 (다음 interval tick 에 자연 수렴)
  const safeIndex = activeIndex < items.length ? activeIndex : 0
  const active = items[safeIndex]
  const others = items.filter((_, i) => i !== safeIndex)

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-[28px] [--hero-cols:1fr] md:[--hero-cols:1.4fr_1fr]"
      style={{ boxShadow: 'var(--shadow-hero)' }}
    >
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
        <HeroLeft active={active} others={others} />

        <div className="hidden md:flex">
          <HeroRanking
            items={items}
            activeIndex={safeIndex}
            lastAggregatedAt={lastAggregatedAt}
            onSelect={handleManualSelect}
          />
        </div>
      </div>
    </div>
  )
}

function HeroLeft({ active, others }: { active: ClusterItem; others: ClusterItem[] }) {
  return (
    <div className="flex flex-col justify-between gap-6">
      <div className="flex flex-col gap-5">
        <LiveBadge publishedAt={active.publishedAt} />
        <h1
          key={active.clusterId}
          className="animate-[fade-in_0.4s_ease-out] font-extrabold leading-tight text-white"
          style={{ fontSize: 'clamp(22px, 3.2vw, 46px)' }}
        >
          {active.title}
        </h1>
        <p
          key={`summary-${active.clusterId}`}
          className="animate-[fade-in_0.4s_ease-out] text-[13px] leading-relaxed sm:text-[15.5px]"
          style={{ color: 'rgba(255,255,255,0.88)' }}
        >
          {active.summary}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <HeroMeta active={active} others={others} />
        <HeroActions clusterId={active.clusterId} />
      </div>
    </div>
  )
}

function LiveBadge({ publishedAt }: { publishedAt: string | null }) {
  const timeLabel = publishedAt ? getTimeAgo(publishedAt) : ''
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

function HeroMeta({ active, others }: { active: ClusterItem; others: ClusterItem[] }) {
  const contextTitles = others
    .slice(0, 3)
    .map((c) => c.title)
    .join(', ')
  const timeAgo = active.publishedAt ? getTimeAgo(active.publishedAt) : ''
  const parts = [
    contextTitles,
    timeAgo,
    active.sourceCount > 0 ? `기사 ${active.sourceCount}건` : ''
  ].filter(Boolean)

  if (parts.length === 0) return null

  return (
    <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.78)' }}>
      {parts.join(' · ')}
    </p>
  )
}

function HeroActions({ clusterId }: { clusterId: number }) {
  const navigate = useNavigate()
  const openChat = useWefiniChatStore((s) => s.open)

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => navigate(`/news/${clusterId}`)}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[13px] font-semibold text-[#053e38] transition-all hover:opacity-90 active:scale-[0.97] sm:px-5 sm:py-2.5 sm:text-[14px]"
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

function HeroRanking({
  items,
  activeIndex,
  lastAggregatedAt,
  onSelect
}: {
  items: ClusterItem[]
  activeIndex: number
  lastAggregatedAt: string | null
  onSelect: (idx: number) => void
}) {
  const freshnessLabel = lastAggregatedAt ? getTimeAgo(lastAggregatedAt) : ''

  return (
    <div className="flex flex-col self-stretch">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2
          className="text-[15px] font-extrabold uppercase tracking-widest text-white"
          style={{ textShadow: '0 0 20px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.15)' }}
        >
          인기 뉴스 TOP
        </h2>
        {freshnessLabel && (
          <span className="text-[11px] font-medium text-white/60">{freshnessLabel} 집계</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {items.map((item, idx) => (
          <RankingRow
            key={item.clusterId}
            item={item}
            rank={idx + 1}
            isActive={idx === activeIndex}
            onSelect={() => onSelect(idx)}
          />
        ))}
      </div>
    </div>
  )
}

function RankingRow({
  item,
  rank,
  isActive,
  onSelect
}: {
  item: ClusterItem
  rank: number
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? 'true' : undefined}
      className="group relative overflow-hidden rounded-2xl px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
      style={{
        background: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className={`font-num shrink-0 text-[22px] font-black leading-none ${
            isActive || rank <= 3 ? 'text-white' : 'text-white/30'
          }`}
          style={
            isActive || rank <= 3
              ? { textShadow: '0 0 16px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.2)' }
              : undefined
          }
        >
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-[15px] leading-snug ${
              isActive ? 'font-bold text-white' : 'font-semibold text-white/90'
            }`}
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.2)' }}
          >
            {item.title}
          </p>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 transition-colors duration-300 ${
            isActive ? 'text-white/60' : 'text-white/0 group-hover:text-white/50'
          }`}
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
