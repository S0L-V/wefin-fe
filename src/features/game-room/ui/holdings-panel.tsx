import { Wallet } from 'lucide-react'

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
    <section className="flex h-[380px] flex-col rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
          <Wallet size={14} className="text-white" />
        </div>
        <h3 className="text-sm font-bold text-wefin-text">보유 종목</h3>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        <div className="space-y-3 rounded-2xl bg-wefin-bg p-4">
          <div className="flex justify-between text-[10px] text-wefin-subtle">
            <div className="flex flex-col">
              <span>보유 현금</span>
              <span className="mt-1 text-xs font-bold text-wefin-text">
                {cash.toLocaleString()}원
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span>평가 금액</span>
              <span className="mt-1 text-xs font-bold text-wefin-text">
                {stockValue.toLocaleString()}원
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-wefin-line pt-2">
            <span className="text-[10px] text-wefin-subtle">평가손익</span>
            <span className={`text-xs font-bold ${profitColor}`}>
              {sign}
              {Math.round(profitAmount).toLocaleString()}원
            </span>
          </div>
        </div>

        {holdingItems.length === 0 ? (
          <p className="py-12 text-center text-[10px] text-wefin-subtle">보유 종목이 없습니다</p>
        ) : (
          <div className="space-y-2">
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
    <div className="rounded-xl bg-wefin-bg px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-wefin-text">{item.stockName}</span>
        <span className="text-xs font-bold text-wefin-text">
          {item.evalAmount.toLocaleString()}원
        </span>
      </div>
      <div className="flex justify-end">
        <span className="text-[10px] font-bold text-wefin-subtle">
          평단 {Math.round(item.avgPrice).toLocaleString()}원
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-wefin-line pt-1">
        <span className="text-[10px] text-wefin-subtle">{item.quantity}주</span>
        <span className={`text-[10px] font-medium ${profitColor}`}>
          {sign}
          {item.profitRate.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

export default HoldingsPanel
