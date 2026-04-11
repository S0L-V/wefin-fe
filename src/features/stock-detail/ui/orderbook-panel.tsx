import type { OrderbookEntry } from '@/features/stock-detail/api/fetch-stock-detail'
import {
  useOrderbookQuery,
  useRecentTradesQuery,
  useStockPriceQuery
} from '@/features/stock-detail/model/use-stock-detail-queries'

interface OrderbookPanelProps {
  code: string
}

export default function OrderbookPanel({ code }: OrderbookPanelProps) {
  const { data: orderbook, isLoading: obLoading } = useOrderbookQuery(code)
  const { data: price } = useStockPriceQuery(code)
  const { data: trades } = useRecentTradesQuery(code)
  const tradeStrength = trades?.[0]?.tradeStrength

  if (obLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs text-gray-400">호가 로딩 중...</span>
      </div>
    )
  }

  if (!orderbook) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs text-gray-400">호가 데이터 없음</span>
      </div>
    )
  }

  const { asks, bids, totalAskQuantity, totalBidQuantity } = orderbook
  const maxQuantity = Math.max(...asks.map((a) => a.quantity), ...bids.map((b) => b.quantity), 1)
  const currentPrice = price?.currentPrice ?? 0
  const totalQuantity = totalAskQuantity + totalBidQuantity
  const askRatio = totalQuantity > 0 ? (totalAskQuantity / totalQuantity) * 100 : 50

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b border-gray-100 px-2 py-1.5">
        <span className="text-xs font-medium text-wefin-text">호가</span>
      </div>

      {/* 호가 테이블 */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-50">
          {[...asks].reverse().map((ask, i) => (
            <AskRow
              key={`ask-${i}`}
              entry={ask}
              maxQuantity={maxQuantity}
              basePrice={currentPrice}
            />
          ))}
        </div>

        <div className="border-y-2 border-wefin-mint bg-wefin-mint-soft px-2 py-1 text-center">
          <span className="text-xs font-bold text-wefin-mint">{currentPrice.toLocaleString()}</span>
        </div>

        <div className="divide-y divide-gray-50">
          {bids.map((bid, i) => (
            <BidRow
              key={`bid-${i}`}
              entry={bid}
              maxQuantity={maxQuantity}
              basePrice={currentPrice}
            />
          ))}
        </div>
      </div>

      {/* 하단 체결강도 + 비율 바 */}
      <div className="border-t border-gray-200 px-2 py-1.5">
        {tradeStrength != null && (
          <div className="mb-1 flex items-center justify-between text-[9px]">
            <span className="text-wefin-subtle">체결강도</span>
            <span
              className={`font-medium ${tradeStrength >= 100 ? 'text-red-500' : 'text-blue-500'}`}
            >
              {tradeStrength.toFixed(2)}%
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-[9px] text-wefin-subtle">
          <span>판매대기 {totalAskQuantity.toLocaleString()}</span>
          <span>구매대기 {totalBidQuantity.toLocaleString()}</span>
        </div>
        <div className="mt-0.5 flex h-1 overflow-hidden rounded-full bg-gray-100">
          <div className="bg-blue-400" style={{ width: `${askRatio}%` }} />
          <div className="bg-red-400" style={{ width: `${100 - askRatio}%` }} />
        </div>
      </div>
    </div>
  )
}

function AskRow({
  entry,
  maxQuantity,
  basePrice
}: {
  entry: OrderbookEntry
  maxQuantity: number
  basePrice: number
}) {
  const changeRate = basePrice > 0 ? ((entry.price - basePrice) / basePrice) * 100 : 0
  const barWidth = (entry.quantity / maxQuantity) * 100

  return (
    <div className="relative flex items-center px-2 py-0.5">
      <div className="absolute left-0 top-0 h-full bg-blue-50" style={{ width: `${barWidth}%` }} />
      <span className="relative z-10 w-12 text-right text-[10px] text-blue-500">
        {entry.quantity.toLocaleString()}
      </span>
      <span className="relative z-10 flex-1 text-center text-[11px] font-medium text-wefin-text">
        {entry.price.toLocaleString()}
      </span>
      <span className="relative z-10 w-11 text-right text-[9px] text-blue-400">
        {changeRate >= 0 ? '+' : ''}
        {changeRate.toFixed(2)}%
      </span>
    </div>
  )
}

function BidRow({
  entry,
  maxQuantity,
  basePrice
}: {
  entry: OrderbookEntry
  maxQuantity: number
  basePrice: number
}) {
  const changeRate = basePrice > 0 ? ((entry.price - basePrice) / basePrice) * 100 : 0
  const barWidth = (entry.quantity / maxQuantity) * 100

  return (
    <div className="relative flex items-center px-2 py-0.5">
      <div className="absolute right-0 top-0 h-full bg-red-50" style={{ width: `${barWidth}%` }} />
      <span className="relative z-10 w-11 text-[9px] text-red-400">
        {changeRate >= 0 ? '+' : ''}
        {changeRate.toFixed(2)}%
      </span>
      <span className="relative z-10 flex-1 text-center text-[11px] font-medium text-wefin-text">
        {entry.price.toLocaleString()}
      </span>
      <span className="relative z-10 w-12 text-right text-[10px] text-red-500">
        {entry.quantity.toLocaleString()}
      </span>
    </div>
  )
}
