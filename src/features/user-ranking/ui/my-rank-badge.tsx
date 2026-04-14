import type { MyRank } from '../api/fetch-user-ranking'

interface MyRankBadgeProps {
  myRank: MyRank
}

export default function MyRankBadge({ myRank }: MyRankBadgeProps) {
  const profit = myRank.realizedProfit ?? 0
  const profitColor = profit >= 0 ? 'text-red-500' : 'text-blue-500'

  return (
    <div className="flex items-center justify-between rounded-2xl bg-wefin-mint-soft px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-wefin-mint">내 순위</span>
        <span className="text-lg font-bold text-wefin-text">{myRank.rank}위</span>
      </div>
      <span className={`text-sm font-semibold ${profitColor}`}>
        {profit >= 0 ? '+' : ''}
        {profit.toLocaleString()}원
      </span>
    </div>
  )
}
