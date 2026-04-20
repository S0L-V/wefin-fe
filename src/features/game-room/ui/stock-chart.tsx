import { useEffect, useMemo, useState } from 'react'

import StockLogo from '@/shared/ui/stock-logo'

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

  const showGuide = !selectedStock && !aggregated

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
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-2">
        {selectedStock ? (
          <div className="flex items-center gap-3">
            <StockLogo code={selectedStock.symbol} name={selectedStock.stockName} size={28} />
            <div>
              <p className="text-[15px] font-bold text-wefin-text">{selectedStock.stockName}</p>
              <p className="font-num text-[11px] font-semibold text-wefin-subtle">
                {selectedStock.symbol}
              </p>
            </div>
            <span className="font-num text-xl font-semibold tabular-nums text-wefin-text">
              {selectedStock.price.toLocaleString('ko-KR')}
              <span className="ml-0.5 text-sm font-medium text-wefin-muted">원</span>
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
        {showGuide && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="text-sm font-semibold text-wefin-text">
                차트를 보려면 종목을 선택하세요
              </p>
              <p className="text-xs leading-relaxed text-wefin-subtle">
                우측 주문 패널에서 섹터와 키워드를 탐색하거나,
                <br />
                검색으로 원하는 종목을 찾아보세요
              </p>
            </div>
          </div>
        )}
        {selectedStock && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-wefin-surface/60">
            <span className="text-sm text-wefin-subtle">차트 로딩 중...</span>
          </div>
        )}
        {selectedStock && !isLoading && isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-wefin-surface">
            <span className="text-sm text-wefin-red">
              차트를 불러오지 못했습니다:{' '}
              {error instanceof Error ? error.message : '알 수 없는 오류'}
            </span>
          </div>
        )}
        {selectedStock && !isLoading && !isError && aggregated && aggregated.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-wefin-surface">
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
