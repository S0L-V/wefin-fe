import { TrendingUp } from 'lucide-react'

import type { RankingItem } from '../model/ranking.schema'
import { useRankingQuery } from '../model/use-ranking-query'

interface GroupRankingProps {
  roomId: string
}

function GroupRanking({ roomId }: GroupRankingProps) {
  const { data: rankings, isLoading } = useRankingQuery(roomId)

  const items = rankings?.data ?? []

  return (
    <section className="flex h-[300px] flex-col rounded-3xl border border-wefin-line bg-white p-5 shadow-sm">
      <header className="mb-4 flex shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500">
          <TrendingUp size={14} className="text-white" />
        </div>
        <h3 className="text-sm font-bold text-wefin-text">그룹 수익률 현황</h3>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <p className="text-xs text-wefin-subtle">로딩 중...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <p className="text-xs text-wefin-subtle">랭킹 정보가 없습니다</p>
          </div>
        ) : (
          items.map((item, index) => <RankingRow key={item.userId} item={item} index={index} />)
        )}
      </div>
    </section>
  )
}

function RankingRow({ item, index }: { item: RankingItem; index: number }) {
  const profitColor = item.profitRate >= 0 ? 'text-red-500' : 'text-blue-500'
  const sign = item.profitRate >= 0 ? '+' : ''

  const medalColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600']
  const medalBg = index < 3 ? medalColors[index] : 'bg-wefin-bg'
  const medalText = index < 3 ? 'text-white' : 'text-wefin-subtle'

  return (
    <div className="flex items-center gap-3 rounded-xl bg-wefin-bg px-4 py-3">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${medalBg} ${medalText}`}
      >
        {item.rank}
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-xs font-bold text-wefin-text">{item.userName}</span>
      </div>

      <div className="flex shrink-0 flex-col text-right">
        <span className="text-xs font-bold text-wefin-text">
          {item.totalAsset.toLocaleString()}원
        </span>
        <span className={`text-[10px] font-medium ${profitColor}`}>
          {sign}
          {item.profitRate.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

export default GroupRanking
