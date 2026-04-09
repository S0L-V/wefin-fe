import { useState } from 'react'

import { useCandlesQuery } from '@/features/stock-detail/model/use-stock-detail-queries'

interface StockPriceTableProps {
  code: string
}

type TableTab = 'price' | 'investor'

export default function StockPriceTable({ code }: StockPriceTableProps) {
  const [activeTab, setActiveTab] = useState<TableTab>('price')
  const { data: candles = [], isLoading } = useCandlesQuery(code, 'D')

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100">
      {/* 탭 헤더 */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-gray-100 px-3 py-1.5">
        <TabButton
          label="시세"
          active={activeTab === 'price'}
          onClick={() => setActiveTab('price')}
        />
        <TabButton
          label="개인·외국인·기관"
          active={activeTab === 'investor'}
          onClick={() => setActiveTab('investor')}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'price' ? (
          <PriceTab candles={candles} isLoading={isLoading} />
        ) : (
          <div className="px-3 py-6 text-center text-[10px] text-gray-400">
            투자자 매매동향 (추후 연동)
          </div>
        )}
      </div>
    </div>
  )
}

function PriceTab({
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
    return <div className="px-3 py-6 text-center text-[10px] text-gray-400">로딩 중...</div>
  }

  if (candles.length === 0) {
    return <div className="px-3 py-6 text-center text-[10px] text-gray-400">데이터 없음</div>
  }

  return (
    <table className="w-full text-[10px]">
      <thead className="sticky top-0 bg-gray-50">
        <tr className="text-wefin-subtle">
          <th className="px-2 py-1.5 text-left font-medium">일자</th>
          <th className="px-2 py-1.5 text-right font-medium">종가</th>
          <th className="px-2 py-1.5 text-right font-medium">등락률</th>
          <th className="px-2 py-1.5 text-right font-medium">거래량</th>
          <th className="px-2 py-1.5 text-right font-medium">시가</th>
          <th className="px-2 py-1.5 text-right font-medium">고가</th>
          <th className="px-2 py-1.5 text-right font-medium">저가</th>
        </tr>
      </thead>
      <tbody>
        {candles.map((c, i) => {
          const prevClose = i < candles.length - 1 ? candles[i + 1].closePrice : c.openPrice
          const changeRate = prevClose !== 0 ? ((c.closePrice - prevClose) / prevClose) * 100 : 0
          const isPositive = changeRate > 0
          const isNegative = changeRate < 0
          const colorClass = isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : ''

          return (
            <tr key={c.date} className="border-t border-gray-50 hover:bg-gray-50">
              <td className="px-2 py-1 text-wefin-subtle">{c.date}</td>
              <td className={`px-2 py-1 text-right font-medium ${colorClass}`}>
                {c.closePrice.toLocaleString()}
              </td>
              <td className={`px-2 py-1 text-right ${colorClass}`}>
                {isPositive ? '+' : ''}
                {changeRate.toFixed(2)}%
              </td>
              <td className="px-2 py-1 text-right text-wefin-subtle">
                {c.volume.toLocaleString()}
              </td>
              <td className="px-2 py-1 text-right">{c.openPrice.toLocaleString()}</td>
              <td className="px-2 py-1 text-right">{c.highPrice.toLocaleString()}</td>
              <td className="px-2 py-1 text-right">{c.lowPrice.toLocaleString()}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function TabButton({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
        active ? 'bg-wefin-text text-white' : 'text-wefin-subtle hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}
