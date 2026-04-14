import { Activity, Globe, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'

import type {
  ChangeDirection,
  MarketSnapshot,
  MetricType
} from '../api/fetch-market-trends-overview'

type Props = {
  snapshots: MarketSnapshot[]
}

const METRIC_ORDER: Record<MetricType, number> = {
  KOSPI: 0,
  NASDAQ: 1,
  BASE_RATE: 2,
  USD_KRW: 3
}

function MarketSnapshotStrip({ snapshots }: Props) {
  if (snapshots.length === 0) return null

  const ordered = [...snapshots].sort(
    (a, b) => METRIC_ORDER[a.metricType] - METRIC_ORDER[b.metricType]
  )

  return (
    <ul className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ordered.map((s) => (
        <li key={s.metricType} className="rounded-xl border border-gray-100 p-3">
          <div className="mb-1.5 flex items-center gap-1 text-wefin-subtle">
            {metricIcon(s.metricType)}
            <span className="text-xs font-medium">{s.label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-wefin-text">{formatValue(s)}</span>
            <span
              className={`flex items-center text-xs font-bold ${directionColor(s.changeDirection)}`}
            >
              {changeIcon(s.changeDirection)}
              {formatChange(s)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function metricIcon(metricType: MetricType): ReactNode {
  switch (metricType) {
    case 'KOSPI':
      return <TrendingUp size={14} />
    case 'NASDAQ':
      return <Globe size={14} />
    case 'BASE_RATE':
      return <Activity size={14} />
    case 'USD_KRW':
      return <span className="text-xs font-medium">$</span>
  }
}

function changeIcon(direction: ChangeDirection): ReactNode {
  if (direction === 'UP') return <TrendingUp size={12} className="mr-0.5" />
  if (direction === 'DOWN') return <TrendingUp size={12} className="mr-0.5 rotate-180" />
  return null
}

function formatValue(s: MarketSnapshot) {
  const formatted = s.value.toLocaleString('ko-KR', {
    maximumFractionDigits: 2
  })
  if (s.unit === 'PERCENT') return `${formatted}%`
  return formatted
}

function formatChange(s: MarketSnapshot) {
  if (s.changeRate == null && s.changeValue == null) return '- 동결'
  // KRW 단위(원화)는 실제 changeValue 부호로 sign을 결정 (changeDirection=FLAT이어도 value가 0이 아닐 수 있어)
  if (s.unit === 'KRW' && s.changeValue != null) {
    const sign = s.changeValue > 0 ? '+' : s.changeValue < 0 ? '-' : ''
    return `${sign}${Math.abs(s.changeValue).toFixed(2)}원`
  }
  if (s.changeRate == null) return ''
  const sign = s.changeDirection === 'UP' ? '+' : s.changeDirection === 'DOWN' ? '-' : ''
  return `${sign}${Math.abs(s.changeRate).toFixed(2)}%`
}

function directionColor(direction: ChangeDirection) {
  if (direction === 'UP') return 'text-red-500'
  if (direction === 'DOWN') return 'text-blue-500'
  return 'text-wefin-subtle'
}

export default MarketSnapshotStrip
