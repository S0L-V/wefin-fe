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
      <div className="flex shrink-0 items-center border-b border-wefin-line px-4 py-3 text-[13px] font-bold text-wefin-subtle sm:px-7 sm:py-4.5 sm:text-[15px]">
        <div className="mr-2 hidden w-6 sm:block" />
        <div className="w-7 sm:w-10">순위</div>
        <div className="mr-4 hidden w-10 sm:block" />
        <div className="flex-1">종목</div>
        <div className="w-auto text-right sm:w-40 sm:text-center">현재가</div>
        <div className="ml-2 w-auto text-right sm:ml-0 sm:w-36 sm:text-center">등락률</div>
        <div className="ml-2 w-auto text-right sm:ml-0 sm:w-40 sm:pr-3">거래대금</div>
        <div className="hidden w-40 pr-3 text-right sm:block">거래량</div>
      </div>
      <div className="min-h-0 flex-1 divide-y divide-wefin-line overflow-y-auto scrollbar-thin">
        {isLoading && items.length === 0 ? (
          <p className="py-10 text-center text-sm text-wefin-subtle">불러오는 중...</p>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-wefin-red">랭킹을 불러올 수 없어요</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-wefin-subtle">데이터가 없어요</p>
        ) : (
          items.map((stock) => <StockRankingRow key={stock.stockCode} stock={stock} />)
        )}
      </div>
    </div>
  )
}
