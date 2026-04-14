import type { RankingItem } from '../api/fetch-user-ranking'

interface RankingRowProps {
  item: RankingItem
}

export default function RankingRow({ item }: RankingRowProps) {
  const profit = item.realizedProfit ?? 0
  const profitColor = profit >= 0 ? 'text-red-500' : 'text-blue-500'

  return (
    <div className="flex items-center gap-3 py-3 text-sm">
      <span className="w-10 font-semibold text-wefin-text">
        {item.rank <= 3 ? <Medal rank={item.rank} /> : item.rank}
      </span>
      <span
        className="w-28 overflow-hidden whitespace-nowrap text-wefin-text"
        style={{
          maskImage: 'linear-gradient(to right, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent)'
        }}
      >
        {item.nickname ?? '-'}
      </span>
      <span className="w-14 text-right text-xs text-wefin-subtle">{item.tradeCount}회</span>
      <span className={`flex-1 text-right font-medium ${profitColor}`}>
        {profit >= 0 ? '+' : ''}
        {profit.toLocaleString()}원
      </span>
    </div>
  )
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span>🥇</span>
  if (rank === 2) return <span>🥈</span>
  if (rank === 3) return <span>🥉</span>
  return <span>{rank}</span>
}
