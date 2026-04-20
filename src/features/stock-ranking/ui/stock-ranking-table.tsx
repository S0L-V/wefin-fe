import type { RankingTab } from '../lib/ranking-data'
import { useStockRankingQuery } from '../model/use-stock-ranking-query'
import StockRankingRow from './stock-ranking-row'

interface StockRankingTableProps {
  activeTab: RankingTab
}

export default function StockRankingTable({ activeTab }: StockRankingTableProps) {
  const { data: items = [], isLoading, isError } = useStockRankingQuery(activeTab)

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-wefin-line px-6 py-4 text-[14px] font-bold text-wefin-subtle">
        <div className="mr-3 w-6" />
        <div className="w-9">순위</div>
        <div className="mr-3.5 w-9" />
        <div className="flex-1">종목</div>
        <div className="w-36 text-center">현재가</div>
        <div className="w-32 text-center">등락률</div>
        <div className="w-36 pr-3 text-right">거래대금</div>
        <div className="w-36 pr-3 text-right">거래량</div>
      </div>
      <div className="min-h-0 flex-1 divide-y divide-wefin-line overflow-y-auto scrollbar-thin">
        {isLoading && items.length === 0 ? (
          <p className="py-10 text-center text-sm text-wefin-subtle">불러오는 중...</p>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-red-500">랭킹을 불러올 수 없어요</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-wefin-subtle">데이터가 없어요</p>
        ) : (
          items.map((stock) => <StockRankingRow key={stock.stockCode} stock={stock} />)
        )}
      </div>
    </div>
  )
}
