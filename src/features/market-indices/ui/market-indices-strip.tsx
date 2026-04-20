import type { ChangeDirection, MarketIndex } from '../api/fetch-market-indices'
import { useMarketIndicesQuery } from '../model/use-market-indices-query'
import IndexSparkline from './index-sparkline'

function directionColor(direction: ChangeDirection): string {
  if (direction === 'UP') return 'text-wefin-red'
  if (direction === 'DOWN') return 'text-wefin-blue'
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

const STRIP_HEIGHT = 'h-[44px]'

export default function MarketIndicesStrip() {
  const { data } = useMarketIndicesQuery({ interval: '5m', sparklinePoints: 80 })

  // 데이터 fetch 전에도 부모(가격 옆) 레이아웃이 점프하지 않도록 고정 높이 유지
  if (!data || data.indices.length === 0) {
    return <div className={`min-w-0 ${STRIP_HEIGHT}`} aria-hidden />
  }

  return (
    <ul
      className={`flex min-w-0 items-center gap-7 overflow-x-auto scrollbar-thin ${STRIP_HEIGHT}`}
    >
      {data.indices.map((index) => (
        <IndexCard key={index.code} index={index} />
      ))}
    </ul>
  )
}

function IndexCard({ index }: { index: MarketIndex }) {
  const colorClass = directionColor(index.changeDirection)
  const sign = directionSign(index.changeDirection)
  const absChangeRate = Math.abs(index.changeRate)

  return (
    <li className="flex shrink-0 items-center gap-3">
      <IndexSparkline
        points={index.sparkline}
        direction={index.changeDirection}
        width={72}
        height={36}
      />
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-bold text-wefin-text">{index.name}</span>
        <div className="flex items-baseline gap-1.5 tabular-nums">
          <span className="text-sm font-semibold text-wefin-text">
            {formatValue(index.currentValue)}
          </span>
          <span className={`text-xs font-semibold ${colorClass}`}>
            {sign}
            {absChangeRate.toFixed(2)}%
          </span>
        </div>
      </div>
    </li>
  )
}
