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
      <div className="flex shrink-0 items-center border-b border-wefin-line px-4 py-2.5 text-[12px] font-bold text-wefin-subtle sm:px-5 sm:py-2.5 xl:px-7 xl:py-3.5 xl:text-[13.5px]">
        <div className="mr-2 hidden w-6 sm:block" />
        <div className="w-7 sm:w-7 xl:w-9">순위</div>
        <div className="mr-2.5 hidden w-7 sm:block xl:mr-3 xl:w-8" />
        <div className="flex-1">종목</div>
        <div className="w-auto text-right sm:w-28 sm:text-center xl:w-36">현재가</div>
        <div className="ml-2 w-auto text-right sm:ml-0 sm:w-24 sm:text-center xl:w-32">등락률</div>
        <div className="ml-2 w-auto text-right sm:ml-0 sm:w-28 sm:pr-3 xl:w-36">거래대금</div>
        <div className="hidden w-28 pr-3 text-right sm:block xl:w-36">거래량</div>
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
