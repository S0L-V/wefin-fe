import StockLogo from '@/shared/ui/stock-logo'

import type { HoldingItem } from '../model/portfolio.schema'
import { useHoldingsQuery, usePortfolioQuery } from '../model/use-portfolio-query'
import { useSelectedStockStore } from '../model/use-selected-stock-store'

interface HoldingsPanelProps {
  roomId: string
}

function HoldingsPanel({ roomId }: HoldingsPanelProps) {
  const { data: portfolio } = usePortfolioQuery(roomId)
  const { data: holdings } = useHoldingsQuery(roomId)

  const cash = portfolio?.data.cash ?? 0
  const stockValue = portfolio?.data.stockValue ?? 0
  const totalAsset = portfolio?.data.totalAsset ?? 0
  const seedMoney = portfolio?.data.seedMoney ?? 0
  const profitAmount = totalAsset - seedMoney
  const profitRate = seedMoney > 0 ? (profitAmount / seedMoney) * 100 : 0
  const profitColor = profitAmount >= 0 ? 'text-wefin-red' : 'text-blue-500'
  const sign = profitAmount >= 0 ? '+' : ''

  const holdingItems = holdings?.data ?? []

  return (
    <section className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center px-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-wefin-text">보유 종목</span>
          {holdingItems.length > 0 && (
            <span className="font-num text-xs font-bold text-wefin-mint">
              {holdingItems.length}
            </span>
          )}
        </div>
      </div>

      <div className="mx-4 mb-2 grid grid-cols-3 gap-0 overflow-hidden rounded-lg border border-wefin-line">
        <SummaryCell label="현금" value={Math.floor(cash)} />
        <SummaryCell label="평가" value={Math.floor(stockValue)} border />
        <SummaryCell label="총자산" value={Math.floor(totalAsset)} border />
      </div>

      <div className="flex items-center justify-end gap-2 px-4 pb-2">
        <span className="text-xs font-bold text-wefin-subtle">평가손익</span>
        <span className={`font-num text-[13px] font-bold tabular-nums ${profitColor}`}>
          {sign}
          {Math.floor(profitAmount).toLocaleString()}원
        </span>
        <span className={`font-num text-[11px] tabular-nums ${profitColor}`}>
          ({sign}
          {profitRate.toFixed(1)}%)
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {holdingItems.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-wefin-muted">보유 종목이 없습니다</p>
          </div>
        ) : (
          <div className="px-2">
            {holdingItems.map((item) => (
              <HoldingRow key={item.symbol} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function SummaryCell({ label, value, border }: { label: string; value: number; border?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center py-2 ${border ? 'border-l border-wefin-line' : ''}`}
    >
      <span className="text-xs font-bold text-wefin-subtle">{label}</span>
      <span className="font-num text-sm font-extrabold tabular-nums text-wefin-text">
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function HoldingRow({ item }: { item: HoldingItem }) {
  const { selectStock } = useSelectedStockStore()
  const profitColor = item.profitRate >= 0 ? 'text-wefin-red' : 'text-blue-500'
  const sign = item.profitRate >= 0 ? '+' : ''

  return (
    <button
      type="button"
      onClick={() =>
        selectStock({
          symbol: item.symbol,
          stockName: item.stockName,
          price: Math.floor(item.evalAmount / item.quantity)
        })
      }
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-wefin-surface-2"
    >
      <StockLogo code={item.symbol} name={item.stockName} size={26} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-wefin-text">{item.stockName}</p>
        <p className="font-num text-[11px] font-medium tabular-nums text-wefin-subtle">
          {item.quantity}주 · {Math.floor(item.avgPrice).toLocaleString()}원
        </p>
      </div>
      <div className="text-right">
        <p className="font-num text-[13px] font-bold tabular-nums text-wefin-text">
          {Math.floor(item.evalAmount).toLocaleString()}
        </p>
        <p className={`font-num text-[11px] font-semibold tabular-nums ${profitColor}`}>
          {sign}
          {item.profitRate.toFixed(2)}%
        </p>
      </div>
    </button>
  )
}

export default HoldingsPanel
