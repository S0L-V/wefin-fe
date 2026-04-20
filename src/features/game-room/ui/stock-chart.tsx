import { useEffect, useMemo, useState } from 'react'

import { aggregateCandles, type ChartInterval } from '../model/aggregate-candles'
import { useLightweightChart } from '../model/use-lightweight-chart'
import { useSelectedStockStore } from '../model/use-selected-stock-store'
import { useStockChart } from '../model/use-stock-chart'

interface StockChartProps {
  roomId: string
}

function StockChart({ roomId }: StockChartProps) {
  const [chartInterval, setChartInterval] = useState<ChartInterval>('day')

  const { selectedStock, selectStock } = useSelectedStockStore()
  const {
    data: chartData,
    isLoading,
    isError,
    error
  } = useStockChart(selectedStock?.symbol ?? null, roomId)

  // 차트 데이터가 갱신되면 마지막 종가로 선택 종목 가격 동기화
  // (턴 전환 시 차트 invalidate → 새 종가 반영)
  useEffect(() => {
    if (!selectedStock || !chartData || chartData.length === 0) return
    const latestClose = chartData[chartData.length - 1].closePrice
    if (latestClose !== selectedStock.price) {
      selectStock({ ...selectedStock, price: latestClose })
    }
  }, [chartData, selectedStock, selectStock])

  const aggregated = useMemo(
    () => (chartData ? aggregateCandles(chartData, chartInterval) : null),
    [chartData, chartInterval]
  )

  // 차트 라이브러리 관련 imperative 로직은 전부 이 훅 안으로 은닉됨
  // ⚠️ 중요: 이 훅의 mount effect는 `[]` deps로 딱 한 번만 실행된다.
  //          따라서 containerRef가 붙은 <div>는 반드시 "항상" 마운트되어 있어야 한다.
  //          (selectedStock 유무로 early return하면 첫 마운트 때 ref가 null이라
  //           차트 인스턴스가 생성되지 않고, 이후에는 effect가 재실행되지 않아 영원히 빈 박스가 됨)
  const { containerRef } = useLightweightChart({
    data: aggregated,
    interval: chartInterval,
    symbol: selectedStock?.symbol ?? null
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between px-3">
        {selectedStock ? (
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-wefin-text">{selectedStock.stockName}</span>
            <span className="text-xs text-wefin-subtle">{selectedStock.symbol}</span>
            <span className="text-sm font-bold tabular-nums text-wefin-text">
              {selectedStock.price.toLocaleString('ko-KR')}원
            </span>
          </div>
        ) : (
          <div />
        )}
        <IntervalTabs value={chartInterval} onChange={setChartInterval} />
      </div>

      {/*
        차트 컨테이너는 항상 렌더링된다 (ref 보장).
        종목 선택/로딩/에러/빈데이터 상태는 전부 오버레이로 얹는다.
      */}
      <div className="relative min-h-0 flex-1 w-full">
        <div ref={containerRef} className="absolute inset-0" />
        {!selectedStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-wefin-subtle">종목을 선택하세요</span>
          </div>
        )}
        {selectedStock && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="text-sm text-wefin-subtle">차트 로딩 중...</span>
          </div>
        )}
        {selectedStock && !isLoading && isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <span className="text-sm text-red-500">
              차트를 불러오지 못했습니다:{' '}
              {error instanceof Error ? error.message : '알 수 없는 오류'}
            </span>
          </div>
        )}
        {selectedStock && !isLoading && !isError && aggregated && aggregated.length === 0 && (
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
