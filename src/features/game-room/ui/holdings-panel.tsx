import type { HoldingItem } from '../model/portfolio.schema'
import { useHoldingsQuery, usePortfolioQuery } from '../model/use-portfolio-query'

interface HoldingsPanelProps {
  roomId: string
}

function HoldingsPanel({ roomId }: HoldingsPanelProps) {
  const { data: portfolio } = usePortfolioQuery(roomId)
  const { data: holdings } = useHoldingsQuery(roomId)

  const cash = portfolio?.data.cash ?? 0
  const stockValue = portfolio?.data.stockValue ?? 0
  const profitAmount = (portfolio?.data.totalAsset ?? 0) - (portfolio?.data.seedMoney ?? 0)
  const profitColor = profitAmount >= 0 ? 'text-red-500' : 'text-blue-500'
  const sign = profitAmount >= 0 ? '+' : ''

  const holdingItems = holdings?.data ?? []

  return (
    <section className="flex h-full flex-col">
      <div className="shrink-0">
        <div className="flex h-11 items-center justify-between px-3">
          <span className="text-sm font-semibold text-wefin-text">보유 종목</span>
          <span className={`text-xs font-bold tabular-nums ${profitColor}`}>
            {sign}
            {Math.round(profitAmount).toLocaleString()}원
          </span>
        </div>
        <div className="flex gap-2 px-3">
          <div className="flex-1 rounded-lg bg-wefin-bg px-2.5 py-2">
            <p className="text-[10px] text-wefin-subtle">현금</p>
            <p className="text-xs font-bold tabular-nums text-wefin-text">
              {cash.toLocaleString()}
            </p>
          </div>
          <div className="flex-1 rounded-lg bg-wefin-bg px-2.5 py-2">
            <p className="text-[10px] text-wefin-subtle">평가</p>
            <p className="text-xs font-bold tabular-nums text-wefin-text">
              {stockValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto px-1">
        {holdingItems.length === 0 ? (
          <p className="pt-4 text-center text-[11px] text-wefin-subtle">보유 종목이 없습니다</p>
        ) : (
          <div className="space-y-0.5">
            {holdingItems.map((item) => (
              <HoldingRow key={item.symbol} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function HoldingRow({ item }: { item: HoldingItem }) {
  const profitColor = item.profitRate >= 0 ? 'text-red-500' : 'text-blue-500'
  const sign = item.profitRate >= 0 ? '+' : ''

  return (
    <div className="flex items-center justify-between rounded-lg px-2.5 py-2 transition-colors hover:bg-wefin-bg">
      <div>
        <p className="text-xs font-semibold text-wefin-text">{item.stockName}</p>
        <p className="text-[10px] tabular-nums text-wefin-subtle">
          {item.quantity}주 · 평단 {Math.round(item.avgPrice).toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold tabular-nums text-wefin-text">
          {item.evalAmount.toLocaleString()}
        </p>
        <p className={`text-[10px] font-semibold tabular-nums ${profitColor}`}>
          {sign}
          {item.profitRate.toFixed(2)}%
        </p>
      </div>
    </div>
  )
}

export default HoldingsPanel
