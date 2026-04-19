import type {
  ChangeDirection,
  MarketSnapshot,
  MetricType
} from '../api/fetch-market-trends-overview'

type Props = {
  snapshots: MarketSnapshot[]
  updatedAt?: string | null
}

const METRIC_ORDER: Record<MetricType, number> = {
  KOSPI: 0,
  NASDAQ: 1,
  BASE_RATE: 2,
  USD_KRW: 3
}

function MarketSnapshotStrip({ snapshots, updatedAt }: Props) {
  if (snapshots.length === 0) return null

  const ordered = [...snapshots].sort(
    (a, b) => METRIC_ORDER[a.metricType] - METRIC_ORDER[b.metricType]
  )

  return (
    <div className="flex items-center gap-5 overflow-x-auto whitespace-nowrap">
      {ordered.map((s) => {
        const isIndex = s.metricType === 'KOSPI' || s.metricType === 'NASDAQ'
        const color = isIndex ? directionTextColor(s.changeDirection) : 'text-wefin-subtle'
        return (
          <div key={s.metricType} className="flex items-baseline gap-1.5">
            <span className="text-xs text-wefin-subtle">{s.label}</span>
            <span className="text-sm font-bold tabular-nums text-wefin-text">{formatValue(s)}</span>
            {isIndex && (
              <span className={`text-xs font-semibold tabular-nums ${color}`}>
                {formatChange(s)}
              </span>
            )}
          </div>
        )
      })}
      {updatedAt && (
        <span className="flex items-center gap-1 text-[11px] text-wefin-subtle">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {updatedAt}
        </span>
      )}
    </div>
  )
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

function directionTextColor(direction: ChangeDirection) {
  if (direction === 'UP') return 'text-red-500'
  if (direction === 'DOWN') return 'text-blue-500'
  return 'text-wefin-subtle'
}

export default MarketSnapshotStrip
