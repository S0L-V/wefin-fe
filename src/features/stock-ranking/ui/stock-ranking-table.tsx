import { MOCK_RANKING } from '../lib/ranking-data'
import StockRankingRow from './stock-ranking-row'

export default function StockRankingTable() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-wefin-line px-5 py-3 text-xs font-medium text-wefin-subtle">
        <div className="mr-2 w-6" />
        <div className="w-8">순위</div>
        <div className="mr-3 w-9" />
        <div className="flex-1">종목</div>
        <div className="w-32 text-right">현재가</div>
        <div className="w-28 text-right">등락률</div>
        <div className="w-32 text-right">거래대금</div>
        <div className="w-32 text-right">거래량</div>
      </div>
      <div className="min-h-0 flex-1 divide-y divide-wefin-line overflow-y-auto scrollbar-thin">
        {MOCK_RANKING.map((stock) => (
          <StockRankingRow key={stock.code} stock={stock} />
        ))}
      </div>
    </div>
  )
}
