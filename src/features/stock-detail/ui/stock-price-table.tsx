import { useCallback, useEffect, useRef, useState } from 'react'

import type { InvestorTrendItem } from '@/features/stock-detail/api/fetch-investor-trend'
import {
  useCandlesQuery,
  useInvestorTrendQuery,
  useRecentTradesQuery
} from '@/features/stock-detail/model/use-stock-detail-queries'
import ResizeHandle from '@/features/stock-detail/ui/resize-handle'
import SegmentedTabs, { type SegmentedTabItem } from '@/shared/ui/segmented-tabs'

interface StockPriceTableProps {
  code: string
}

type PriceSubTab = 'realtime' | 'daily'

const PRICE_SUB_TABS: SegmentedTabItem<PriceSubTab>[] = [
  { key: 'realtime', label: '실시간' },
  { key: 'daily', label: '일별' }
]

const MIN_LEFT_WIDTH = 220
const MIN_RIGHT_WIDTH = 320

export default function StockPriceTable({ code }: StockPriceTableProps) {
  const [priceSubTab, setPriceSubTab] = useState<PriceSubTab>('realtime')
  const [leftWidth, setLeftWidth] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: candles = [], isLoading: candlesLoading } = useCandlesQuery(code, 'D')
  const { data: trades = [], isLoading: tradesLoading } = useRecentTradesQuery(code)
  const { data: investorTrend, isLoading: investorLoading } = useInvestorTrendQuery(code)

  useEffect(() => {
    if (leftWidth !== null) return
    const el = containerRef.current
    if (!el) return
    setLeftWidth(el.getBoundingClientRect().width / 2)
  }, [leftWidth])

  const handleResize = useCallback((delta: number) => {
    setLeftWidth((prev) => {
      const container = containerRef.current
      if (!container || prev === null) return prev
      const max = container.getBoundingClientRect().width - MIN_RIGHT_WIDTH
      return Math.max(MIN_LEFT_WIDTH, Math.min(max, prev + delta))
    })
  }, [])

  return (
    <div ref={containerRef} className="flex h-full">
      {/* 좌측 모듈: 개인·외국인·기관 */}
      <div
        className="flex min-w-0 shrink-0 flex-col overflow-hidden rounded-xl border border-wefin-line bg-white"
        style={{ width: leftWidth ?? '50%' }}
      >
        <div className="flex h-11 shrink-0 items-center px-3">
          <span className="text-sm font-semibold text-wefin-text">개인·외국인·기관</span>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin">
          <InvestorTrendTable items={investorTrend?.items ?? []} isLoading={investorLoading} />
        </div>
      </div>

      <ResizeHandle onResize={handleResize} />

      {/* 우측 모듈: 시세 */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-wefin-line bg-white">
        <div className="flex h-11 shrink-0 items-center justify-between px-3">
          <span className="text-sm font-semibold text-wefin-text">시세</span>
          <SegmentedTabs items={PRICE_SUB_TABS} activeKey={priceSubTab} onChange={setPriceSubTab} />
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin">
          {priceSubTab === 'realtime' ? (
            <RealtimeTab trades={trades} isLoading={tradesLoading} />
          ) : (
            <DailyTab candles={candles} isLoading={candlesLoading} />
          )}
        </div>
      </div>
    </div>
  )
}

function RealtimeTab({
  trades,
  isLoading
}: {
  trades: {
    tradeTime: string
    price: number
    changePrice: number
    changeSign: string
    changeRate: number
    volume: number
    tradeStrength: number
  }[]
  isLoading: boolean
}) {
  if (isLoading) {
    return <div className="px-3 py-6 text-center text-xs text-wefin-subtle">로딩 중...</div>
  }

  if (trades.length === 0) {
    return <div className="px-3 py-6 text-center text-xs text-wefin-subtle">체결 내역 없음</div>
  }

  return (
    <table className="table-fixed w-full text-xs">
      <thead className="sticky top-0 bg-wefin-bg">
        <tr className="text-wefin-subtle">
          <th className="px-2 py-1.5 text-left font-semibold">체결가</th>
          <th className="px-2 py-1.5 text-right font-semibold">체결량(주)</th>
          <th className="px-2 py-1.5 text-right font-semibold">등락률</th>
          <th className="px-2 py-1.5 text-right font-semibold">시간</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t, i) => {
          const isPositive = t.changeRate > 0
          const isNegative = t.changeRate < 0
          const colorClass = isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : ''
          const timeDisplay = formatTradeTime(t.tradeTime)

          return (
            <tr
              key={`${t.tradeTime}-${i}`}
              className="border-t border-wefin-line hover:bg-wefin-bg"
            >
              <td className={`px-2 py-1 font-semibold tabular-nums ${colorClass}`}>
                {t.price.toLocaleString()}원
              </td>
              <td className={`px-2 py-1 text-right font-medium tabular-nums ${colorClass}`}>
                {t.volume.toLocaleString()}
              </td>
              <td className={`px-2 py-1 text-right font-semibold tabular-nums ${colorClass}`}>
                {isPositive ? '+' : ''}
                {t.changeRate.toFixed(2)}%
              </td>
              <td className="px-2 py-1 text-right font-medium text-wefin-subtle tabular-nums">
                {timeDisplay}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function DailyTab({
  candles,
  isLoading
}: {
  candles: {
    date: string
    openPrice: number
    highPrice: number
    lowPrice: number
    closePrice: number
    volume: number
  }[]
  isLoading: boolean
}) {
  if (isLoading) {
    return <div className="px-3 py-6 text-center text-xs text-wefin-subtle">로딩 중...</div>
  }

  if (candles.length === 0) {
    return <div className="px-3 py-6 text-center text-xs text-wefin-subtle">데이터 없음</div>
  }

  return (
    <table className="table-fixed w-full text-xs">
      <thead className="sticky top-0 bg-wefin-bg">
        <tr className="text-wefin-subtle">
          <th className="px-2 py-1.5 text-left font-semibold">일자</th>
          <th className="px-2 py-1.5 text-right font-semibold">종가</th>
          <th className="px-2 py-1.5 text-right font-semibold">등락률</th>
          <th className="px-2 py-1.5 text-right font-semibold">거래량</th>
          <th className="px-2 py-1.5 text-right font-semibold">시가</th>
          <th className="px-2 py-1.5 text-right font-semibold">고가</th>
          <th className="px-2 py-1.5 text-right font-semibold">저가</th>
        </tr>
      </thead>
      <tbody>
        {candles.map((c, i) => {
          const prevClose = i > 0 ? candles[i - 1].closePrice : c.openPrice
          const changeRate = prevClose !== 0 ? ((c.closePrice - prevClose) / prevClose) * 100 : 0
          const isPositive = changeRate > 0
          const isNegative = changeRate < 0
          const colorClass = isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : ''

          return (
            <tr key={c.date} className="border-t border-wefin-line hover:bg-wefin-bg">
              <td className="px-2 py-1 font-medium text-wefin-subtle tabular-nums">
                {c.date.substring(5, 10).replace('-', '.')}
              </td>
              <td className={`px-2 py-1 text-right font-semibold tabular-nums ${colorClass}`}>
                {c.closePrice.toLocaleString()}
              </td>
              <td className={`px-2 py-1 text-right font-semibold tabular-nums ${colorClass}`}>
                {isPositive ? '+' : ''}
                {changeRate.toFixed(2)}%
              </td>
              <td className="px-2 py-1 text-right font-medium text-wefin-subtle tabular-nums">
                {c.volume.toLocaleString()}
              </td>
              <td className="px-2 py-1 text-right font-medium text-wefin-text tabular-nums">
                {c.openPrice.toLocaleString()}
              </td>
              <td className="px-2 py-1 text-right font-medium text-wefin-text tabular-nums">
                {c.highPrice.toLocaleString()}
              </td>
              <td className="px-2 py-1 text-right font-medium text-wefin-text tabular-nums">
                {c.lowPrice.toLocaleString()}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function formatTradeTime(tradeTime: string): string {
  if (tradeTime.length >= 6) {
    return `${tradeTime.slice(0, 2)}:${tradeTime.slice(2, 4)}:${tradeTime.slice(4, 6)}`
  }
  return tradeTime
}

function InvestorTrendTable({
  items,
  isLoading
}: {
  items: InvestorTrendItem[]
  isLoading: boolean
}) {
  if (isLoading) {
    return <div className="px-3 py-6 text-center text-xs text-wefin-subtle">로딩 중...</div>
  }

  if (items.length === 0) {
    return <div className="px-3 py-6 text-center text-xs text-wefin-subtle">데이터 없음</div>
  }

  return (
    <table className="table-fixed w-full text-xs">
      <thead className="sticky top-0 bg-wefin-bg">
        <tr className="text-wefin-subtle">
          <th className="px-2 py-1.5 text-left font-semibold">일자</th>
          <th className="px-2 py-1.5 text-right font-semibold">개인</th>
          <th className="px-2 py-1.5 text-right font-semibold">외국인</th>
          <th className="px-2 py-1.5 text-right font-semibold">기관</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr
            key={item.date ?? `idx-${i}`}
            className="border-t border-wefin-line hover:bg-wefin-bg"
          >
            <td className="px-2 py-1 font-medium text-wefin-subtle tabular-nums">
              {formatInvestorDate(item.date)}
            </td>
            <NetBuyCell value={item.individualNetBuy} />
            <NetBuyCell value={item.foreignNetBuy} />
            <NetBuyCell value={item.institutionNetBuy} />
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function NetBuyCell({ value }: { value: number }) {
  const colorClass = value > 0 ? 'text-red-500' : value < 0 ? 'text-blue-500' : 'text-wefin-text'
  return (
    <td className={`px-2 py-1 text-right font-semibold tabular-nums ${colorClass}`}>
      {formatNetBuyQty(value)}
    </td>
  )
}

// 순매수 수량을 천 단위 구분으로 표기. 부호는 값 그대로 (음수면 '-').
function formatNetBuyQty(value: number): string {
  if (value === 0) return '0'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toLocaleString()}`
}

// BE에서 ISO 날짜 (yyyy-MM-dd) 로 내려옴. "MM.DD" 로 축약.
function formatInvestorDate(raw: string | null): string {
  if (!raw) return '-'
  return raw.length >= 10 ? `${raw.slice(5, 7)}.${raw.slice(8, 10)}` : raw
}
