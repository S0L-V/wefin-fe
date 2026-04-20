import { useRef } from 'react'

import type { MarketIndex } from '@/features/market-indices/api/fetch-market-indices'
import { useMarketIndicesQuery } from '@/features/market-indices/model/use-market-indices-query'
import type { StockRankingItem } from '@/features/stock-ranking/api/fetch-stock-ranking'
import { useStockRankingQuery } from '@/features/stock-ranking/model/use-stock-ranking-query'

function getChangeColor(direction: 'UP' | 'DOWN' | 'FLAT') {
  if (direction === 'UP') return 'text-wefin-green'
  if (direction === 'DOWN') return 'text-wefin-red'
  return 'text-wefin-muted'
}

function getSignColor(sign: string) {
  if (sign === '1' || sign === '2') return 'text-wefin-green'
  if (sign === '4' || sign === '5') return 'text-wefin-red'
  return 'text-wefin-muted'
}

function formatChangeRate(rate: number, isPositive: boolean) {
  const prefix = isPositive ? '+' : '-'
  return `${prefix}${Math.abs(rate).toFixed(2)}%`
}

function IndexItem({ index }: { index: MarketIndex }) {
  const color = getChangeColor(index.changeDirection)
  const isPositive = index.changeDirection === 'UP'

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <span className="text-wefin-subtle font-medium text-[13px]">{index.name}</span>
      <span className="font-num font-bold text-wefin-text">
        {index.currentValue.toLocaleString('ko-KR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </span>
      <span className={`font-num font-bold text-[12px] ${color}`}>
        {formatChangeRate(index.changeRate, isPositive)}
      </span>
    </span>
  )
}

function StockItem({ stock }: { stock: StockRankingItem }) {
  const isPositive = stock.changeSign === '1' || stock.changeSign === '2'
  const isNegative = stock.changeSign === '4' || stock.changeSign === '5'
  const color = getSignColor(stock.changeSign)

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <span className="text-wefin-subtle font-medium text-[13px]">{stock.stockName}</span>
      <span className="font-num font-bold text-wefin-text">
        {stock.currentPrice.toLocaleString('ko-KR')}
      </span>
      <span className={`font-num font-bold text-[12px] ${color}`}>
        {isPositive
          ? `+${Math.abs(stock.changeRate).toFixed(2)}%`
          : isNegative
            ? `-${Math.abs(stock.changeRate).toFixed(2)}%`
            : `${stock.changeRate.toFixed(2)}%`}
      </span>
    </span>
  )
}

export default function TickerMarquee() {
  const { data: indicesData } = useMarketIndicesQuery()
  const { data: rankingData } = useStockRankingQuery('amount', 8)
  const trackRef = useRef<HTMLDivElement>(null)

  const indices = indicesData?.indices ?? []
  const stocks = rankingData ?? []

  if (indices.length === 0 && stocks.length === 0) return null

  const items = (
    <>
      {indices.map((index) => (
        <IndexItem key={index.code} index={index} />
      ))}
      {stocks.map((stock) => (
        <StockItem key={stock.stockCode} stock={stock} />
      ))}
    </>
  )

  return (
    <div
      className="w-full border-b border-wefin-line bg-wefin-bg overflow-hidden py-2.5"
      onMouseEnter={() => {
        if (trackRef.current) trackRef.current.style.animationPlayState = 'paused'
      }}
      onMouseLeave={() => {
        if (trackRef.current) trackRef.current.style.animationPlayState = 'running'
      }}
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 30s linear infinite' }}
      >
        <div className="flex gap-12 shrink-0 pr-12">{items}</div>
        <div className="flex gap-12 shrink-0 pr-12" aria-hidden>
          {items}
        </div>
      </div>
    </div>
  )
}
