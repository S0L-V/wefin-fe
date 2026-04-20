import type { RankingItem } from '../model/ranking.schema'
import { useRankingQuery } from '../model/use-ranking-query'

interface GroupRankingProps {
  roomId: string
}

function GroupRanking({ roomId }: GroupRankingProps) {
  const { data: rankings, isLoading } = useRankingQuery(roomId)
  const items = rankings?.data ?? []

  return (
    <section className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center px-3">
        <span className="text-sm font-semibold text-wefin-text">랭킹</span>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-1">
        {isLoading ? (
          <div className="space-y-1.5 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="pt-6 text-center text-xs text-wefin-subtle">랭킹 정보가 없습니다</p>
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

  const isTop3 = index < 3
  const rankColors = [
    'bg-amber-400 text-white',
    'bg-gray-300 text-white',
    'bg-amber-600/80 text-white'
  ]

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${isTop3 ? 'bg-wefin-mint-soft/30' : ''}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
          isTop3 ? rankColors[index] : 'bg-wefin-bg text-wefin-subtle'
        }`}
      >
        {item.rank}
      </span>

      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-wefin-text">
        {item.userName}
      </span>

      <div className="shrink-0 text-right">
        <p className={`text-xs font-bold tabular-nums ${profitColor}`}>
          {sign}
          {item.profitRate.toFixed(2)}%
        </p>
      </div>
    </div>
  )
}

export default GroupRanking
