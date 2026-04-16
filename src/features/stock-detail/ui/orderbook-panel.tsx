import type { OrderbookEntry } from '@/features/stock-detail/api/fetch-stock-detail'
import {
  useOrderbookQuery,
  useRecentTradesQuery,
  useStockPriceQuery
} from '@/features/stock-detail/model/use-stock-detail-queries'

import OrderbookPriceSummary from './orderbook-price-summary'

interface OrderbookPanelProps {
  code: string
  onPriceClick?: (price: number) => void
}

export default function OrderbookPanel({ code, onPriceClick }: OrderbookPanelProps) {
  const { data: orderbook, isLoading: obLoading } = useOrderbookQuery(code)
  const { data: price } = useStockPriceQuery(code)
  const { data: trades } = useRecentTradesQuery(code)
  const tradeStrength = trades?.[0]?.tradeStrength

  if (obLoading) return <Status text="호가 로딩 중..." />
  if (!orderbook) return <Status text="호가 데이터 없음" />

  const { asks, bids, totalAskQuantity, totalBidQuantity } = orderbook
  const maxQuantity = Math.max(...asks.map((a) => a.quantity), ...bids.map((b) => b.quantity), 1)
  const currentPrice = price?.currentPrice ?? 0
  const totalQuantity = totalAskQuantity + totalBidQuantity
  const askRatio = totalQuantity > 0 ? (totalAskQuantity / totalQuantity) * 100 : 50

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 items-center px-3">
        <span className="text-sm font-semibold text-wefin-text">호가</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {[...asks].reverse().map((ask, i) => (
          <AskRow
            key={`ask-${i}`}
            entry={ask}
            maxQuantity={maxQuantity}
            basePrice={currentPrice}
            isCurrent={ask.price === currentPrice}
            onClick={onPriceClick}
          />
        ))}
        {bids.map((bid, i) => (
          <BidRow
            key={`bid-${i}`}
            entry={bid}
            maxQuantity={maxQuantity}
            basePrice={currentPrice}
            isCurrent={bid.price === currentPrice}
            onClick={onPriceClick}
          />
        ))}
      </div>

      {price && <OrderbookPriceSummary price={price} />}

      <div className="border-t border-wefin-line px-3 py-1.5">
        {tradeStrength != null && (
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-wefin-subtle">체결강도</span>
            <span
              className={`font-semibold ${tradeStrength >= 100 ? 'text-red-500' : 'text-blue-500'}`}
            >
              {tradeStrength.toFixed(2)}%
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-500">판매대기 {totalAskQuantity.toLocaleString()}</span>
          <span className="text-red-500">구매대기 {totalBidQuantity.toLocaleString()}</span>
        </div>
        <div className="mt-1 flex h-1 overflow-hidden rounded-full bg-gray-100">
          <div className="bg-blue-400" style={{ width: `${askRatio}%` }} />
          <div className="bg-red-400" style={{ width: `${100 - askRatio}%` }} />
        </div>
      </div>
    </div>
  )
}

function Status({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="text-xs text-wefin-subtle">{text}</span>
    </div>
  )
}

interface RowProps {
  entry: OrderbookEntry
  maxQuantity: number
  basePrice: number
  isCurrent: boolean
  onClick?: (price: number) => void
}

function rowOuterClass(isCurrent: boolean, clickable: boolean): string {
  const base = `relative grid min-h-0 flex-1 grid-cols-3 items-center px-3 text-xs ${
    clickable ? 'cursor-pointer hover:bg-wefin-bg' : ''
  }`
  return isCurrent ? `${base} rounded-md border-[2px] border-wefin-mint-deep` : base
}

function AskRow({ entry, maxQuantity, basePrice, isCurrent, onClick }: RowProps) {
  const changeRate = basePrice > 0 ? ((entry.price - basePrice) / basePrice) * 100 : 0
  const barWidth = (entry.quantity / maxQuantity) * 100

  return (
    <div
      className={rowOuterClass(isCurrent, !!onClick)}
      onClick={() => onClick?.(entry.price)}
      onKeyDown={(e) => {
        if (!onClick) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(entry.price)
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${entry.price.toLocaleString()}원 선택` : undefined}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-200/70 to-transparent"
        style={{ width: `${barWidth}%` }}
      />
      <span className="relative z-10 pl-2 text-left font-semibold text-blue-600 tabular-nums">
        {entry.quantity.toLocaleString()}
      </span>
      <span className="relative z-10 text-center font-medium text-wefin-text tabular-nums">
        {entry.price.toLocaleString()}
      </span>
      <span className="relative z-10 text-right font-semibold text-blue-500 tabular-nums">
        {changeRate >= 0 ? '+' : ''}
        {changeRate.toFixed(2)}%
      </span>
    </div>
  )
}

function BidRow({ entry, maxQuantity, basePrice, isCurrent, onClick }: RowProps) {
  const changeRate = basePrice > 0 ? ((entry.price - basePrice) / basePrice) * 100 : 0
  const barWidth = (entry.quantity / maxQuantity) * 100

  return (
    <div
      className={rowOuterClass(isCurrent, !!onClick)}
      onClick={() => onClick?.(entry.price)}
      onKeyDown={(e) => {
        if (!onClick) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(entry.price)
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${entry.price.toLocaleString()}원 선택` : undefined}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-200/70 to-transparent"
        style={{ width: `${barWidth}%` }}
      />
      <span className="relative z-10 text-left font-semibold text-red-500 tabular-nums">
        {changeRate >= 0 ? '+' : ''}
        {changeRate.toFixed(2)}%
      </span>
      <span className="relative z-10 text-center font-medium text-wefin-text tabular-nums">
        {entry.price.toLocaleString()}
      </span>
      <span className="relative z-10 pr-2 text-right font-semibold text-red-600 tabular-nums">
        {entry.quantity.toLocaleString()}
      </span>
    </div>
  )
}
