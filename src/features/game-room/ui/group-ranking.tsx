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
      <div className="flex h-12 shrink-0 items-center px-4">
        <span className="text-sm font-bold text-wefin-text">랭킹</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-wefin-surface-2" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-wefin-muted">랭킹 정보가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map((item, index) => (
              <RankingRow key={item.userId} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function RankingRow({ item, index }: { item: RankingItem; index: number }) {
  const profitColor = item.profitRate >= 0 ? 'text-wefin-red' : 'text-blue-400'
  const sign = item.profitRate >= 0 ? '+' : ''
  const isTop3 = index < 3
  const allColors = [
    ['#0f8385', '#34d399'],
    ['#2563eb', '#60a5fa'],
    ['#7c3aed', '#a78bfa'],
    ['#e11d48', '#fb7185'],
    ['#d97706', '#fbbf24'],
    ['#334155', '#64748b']
  ]
  const [from, to] = allColors[index % allColors.length]
  const initial = item.userName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        isTop3 ? 'bg-wefin-surface-2' : 'hover:bg-wefin-surface-2'
      }`}
    >
      <span
        className={`font-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
          index === 0
            ? 'bg-amber-400 text-white'
            : index === 1
              ? 'bg-gray-400 text-white'
              : index === 2
                ? 'bg-amber-600 text-white'
                : 'bg-wefin-surface-2 text-wefin-muted'
        }`}
      >
        {item.rank}
      </span>

      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {initial}
      </span>

      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-wefin-text">
        {item.userName}
      </span>

      <div className="shrink-0 text-right">
        <p className={`font-num text-[13px] font-bold tabular-nums ${profitColor}`}>
          {sign}
          {item.profitRate.toFixed(2)}%
        </p>
        <p className="font-num text-[10px] font-semibold tabular-nums text-wefin-subtle">
          {Math.floor(item.totalAsset).toLocaleString()}원
        </p>
      </div>
    </div>
  )
}

export default GroupRanking
