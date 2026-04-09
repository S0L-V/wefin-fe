import { useMemo, useState } from 'react'

import { aggregateCandles, type ChartInterval } from '../model/aggregate-candles'
import { useLightweightChart } from '../model/use-lightweight-chart'
import { useSelectedStockStore } from '../model/use-selected-stock-store'
import { useStockChart } from '../model/use-stock-chart'

interface StockChartProps {
  roomId: string
}

function StockChart({ roomId }: StockChartProps) {
  const [chartInterval, setChartInterval] = useState<ChartInterval>('day')

  const { selectedStock } = useSelectedStockStore()
  const {
    data: chartData,
    isLoading,
    isError,
    error
  } = useStockChart(selectedStock?.symbol ?? null, roomId)

  const aggregated = useMemo(
    () => (chartData ? aggregateCandles(chartData, chartInterval) : null),
    [chartData, chartInterval]
  )

  // 차트 라이브러리 관련 imperative 로직은 전부 이 훅 안으로 은닉됨
  const { containerRef } = useLightweightChart({
    data: aggregated,
    interval: chartInterval,
    symbol: selectedStock?.symbol ?? null
  })

  if (!selectedStock) {
    return (
      <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
        <span className="text-sm font-bold text-wefin-subtle">
          종목을 선택하면 차트가 표시됩니다
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-[350px] rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-wefin-text">{selectedStock.stockName}</h3>
            <span className="text-[10px] text-wefin-subtle">{selectedStock.symbol}</span>
          </div>
          <div className="text-xs font-bold text-wefin-text">
            {selectedStock.price.toLocaleString('ko-KR')}원
          </div>
        </div>
        <div className="flex items-center gap-3">
          <IntervalTabs value={chartInterval} onChange={setChartInterval} />
          <a
            href="https://www.tradingview.com/lightweight-charts/"
            target="_blank"
            rel="noreferrer noopener"
            title="Powered by TradingView Lightweight Charts™"
            className="text-xs text-wefin-subtle underline transition-colors hover:text-wefin-text"
          >
            TradingView™
          </a>
        </div>
      </div>

      <div className="relative h-[280px] w-full">
        <div ref={containerRef} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="text-sm text-wefin-subtle">차트 로딩 중...</span>
          </div>
        )}
        {!isLoading && isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <span className="text-sm text-red-500">
              차트를 불러오지 못했습니다:{' '}
              {error instanceof Error ? error.message : '알 수 없는 오류'}
            </span>
          </div>
        )}
        {!isLoading && !isError && aggregated && aggregated.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <span className="text-sm text-wefin-subtle">차트 데이터가 없습니다</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface IntervalTabsProps {
  value: ChartInterval
  onChange: (next: ChartInterval) => void
}

const INTERVAL_OPTIONS: { value: ChartInterval; label: string }[] = [
  { value: 'day', label: '일봉' },
  { value: 'week', label: '주봉' },
  { value: 'month', label: '월봉' }
]

function IntervalTabs({ value, onChange }: IntervalTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-wefin-bg p-1">
      {INTERVAL_OPTIONS.map((opt) => {
        const isActive = value === opt.value
        const className = isActive
          ? 'bg-wefin-mint text-white'
          : 'text-wefin-subtle hover:text-wefin-text'
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${className}`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default StockChart
