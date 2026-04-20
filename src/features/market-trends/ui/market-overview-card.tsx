import { useEffect, useRef, useState } from 'react'

import type {
  ChangeDirection,
  MarketIndex,
  SparklinePoint
} from '@/features/market-indices/api/fetch-market-indices'
import { useMarketIndicesQuery } from '@/features/market-indices/model/use-market-indices-query'
import { useMarketTrendsOverviewQuery } from '@/features/market-trends/model/use-market-trends-overview-query'

const INDEX_LABEL: Record<string, string> = {
  KOSPI: 'KOSPI',
  KOSDAQ: 'KOSDAQ',
  NASDAQ: 'NASDAQ',
  SP500: 'S&P 500'
}

/* ─── color helpers ─── */

const DIRECTION_COLOR: Record<ChangeDirection, string> = {
  UP: '#ef4444',
  DOWN: '#3b82f6',
  FLAT: '#9ca3af'
}

function directionTextClass(direction: ChangeDirection): string {
  if (direction === 'UP') return 'text-wefin-red'
  if (direction === 'DOWN') return 'text-blue-400'
  return 'text-wefin-subtle'
}

function directionSign(direction: ChangeDirection): string {
  if (direction === 'UP') return '+'
  if (direction === 'DOWN') return '-'
  return ''
}

function formatValue(value: number): string {
  return value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
}

/* ─── Sparkline (pure SVG) ─── */

function Sparkline({ points, color }: { points: SparklinePoint[]; color: string }) {
  if (points.length < 2) return <div className="h-[36px] w-full" aria-hidden />

  const values = points.map((p) => p.v)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const W = 100
  const H = 32
  const pad = 1

  const coords = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: pad + (1 - (v - min) / range) * (H - pad * 2)
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-[36px] w-full"
      aria-hidden
    >
      <path d={areaPath} fill={color} fillOpacity={0.12} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  )
}

/* ─── Count-up hook ─── */

function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress)
      setValue(target * eased)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  return value
}

/* ─── Index Cell ─── */

function IndexCell({ index, isLast }: { index: MarketIndex; isLast: boolean }) {
  const animatedValue = useCountUp(index.currentValue)
  const colorClass = directionTextClass(index.changeDirection)
  const sign = directionSign(index.changeDirection)
  const absRate = Math.abs(index.changeRate)
  const sparkColor = DIRECTION_COLOR[index.changeDirection]

  return (
    <div
      className="flex flex-col justify-between"
      style={{
        padding: 'var(--card-pad)',
        borderRight: isLast ? 'none' : '1px solid var(--color-wefin-line)'
      }}
    >
      <div>
        <div className="mb-1">
          <span className="font-num text-[13px] font-bold text-wefin-text-2">
            {INDEX_LABEL[index.code] ?? index.name}
          </span>
        </div>
        <div
          className="font-num mb-0.5 text-[26px] font-[800] text-wefin-text"
          style={{ letterSpacing: '-0.03em' }}
        >
          {formatValue(animatedValue)}
        </div>
        <div className={`font-num text-[13px] font-bold ${colorClass}`}>
          {sign}
          {absRate.toFixed(2)}%
        </div>
      </div>
      <div className="mt-3">
        <Sparkline points={index.sparkline} color={sparkColor} />
      </div>
    </div>
  )
}

/* ─── Skeleton ─── */

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-wefin-line ${className ?? ''}`} />
}

function MarketOverviewSkeleton() {
  return (
    <div
      className="card-base"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr 1fr 1fr 1fr'
      }}
    >
      {/* headline skeleton */}
      <div
        className="flex flex-col gap-3"
        style={{
          padding: 'var(--card-pad)',
          borderRight: '1px dashed var(--color-wefin-line)'
        }}
      >
        <SkeletonPulse className="h-3 w-14" />
        <SkeletonPulse className="h-6 w-24" />
        <div className="mt-auto rounded-xl border border-wefin-line bg-wefin-surface-2 p-3">
          <SkeletonPulse className="mb-2 h-2.5 w-16" />
          <SkeletonPulse className="h-3 w-full" />
          <SkeletonPulse className="mt-1 h-3 w-3/4" />
        </div>
      </div>

      {/* index cell skeletons */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-2"
          style={{
            padding: 'var(--card-pad)',
            borderRight: i < 3 ? '1px solid var(--color-wefin-line)' : 'none'
          }}
        >
          <SkeletonPulse className="h-3 w-16" />
          <SkeletonPulse className="h-7 w-28" />
          <SkeletonPulse className="h-3.5 w-14" />
          <SkeletonPulse className="mt-auto h-[36px] w-full" />
        </div>
      ))}
    </div>
  )
}

/* ─── Main Card ─── */

export function MarketOverviewGrid() {
  const { data: indicesData, isLoading } = useMarketIndicesQuery({
    interval: '5m',
    sparklinePoints: 80
  })

  if (isLoading) return <MarketOverviewSkeleton />

  const indices = indicesData?.indices ?? []
  if (indices.length === 0) return null

  const displayIndices = indices.slice(0, 4)

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4"
      style={{
        borderBottom: '1px dashed var(--color-wefin-line)'
      }}
    >
      {displayIndices.map((index, i) => (
        <IndexCell key={index.code} index={index} isLast={i === displayIndices.length - 1} />
      ))}
    </div>
  )
}

export default function MarketOverviewCard() {
  const { data: indicesData, isLoading: indicesLoading } = useMarketIndicesQuery({
    interval: '5m',
    sparklinePoints: 80
  })
  const { data: trendsData, isLoading: trendsLoading } = useMarketTrendsOverviewQuery()

  if (indicesLoading || trendsLoading) {
    return <MarketOverviewSkeleton />
  }

  const indices = indicesData?.indices ?? []
  const summary = trendsData?.summary ?? null

  if (indices.length === 0) return null

  // Show up to 4 indices
  const displayIndices = indices.slice(0, 4)

  return (
    <div
      className="card-base"
      style={{
        display: 'grid',
        gridTemplateColumns: `1.1fr${' 1fr'.repeat(displayIndices.length)}`
      }}
    >
      {/* Column 1: Headline */}
      <div
        className="flex flex-col justify-between"
        style={{
          padding: 'var(--card-pad)',
          background: 'linear-gradient(180deg, var(--color-wefin-mint-soft), transparent 120%)',
          borderRight: '1px dashed var(--color-wefin-line)'
        }}
      >
        <div>
          <p className="text-[12px] text-wefin-subtle">오늘 시장</p>
          <h2 className="text-[22px] font-[800] text-wefin-text">한눈에 보기</h2>
        </div>

        {summary && (
          <div className="mt-4 rounded-xl border border-wefin-line bg-wefin-surface p-3">
            <p
              className="mb-1.5 text-[10.5px] font-bold uppercase text-wefin-mint-deep"
              style={{ letterSpacing: '0.12em' }}
            >
              AI 코멘트
            </p>
            <p className="text-[12.5px] leading-snug text-wefin-text-2">{summary}</p>
          </div>
        )}
      </div>

      {/* Columns 2-5: Index cells */}
      {displayIndices.map((index, i) => (
        <IndexCell key={index.code} index={index} isLast={i === displayIndices.length - 1} />
      ))}
    </div>
  )
}
