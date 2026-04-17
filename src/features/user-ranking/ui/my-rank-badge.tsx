import type { MyRank } from '../api/fetch-user-ranking'

interface MyRankBadgeProps {
  myRank: MyRank
}

export default function MyRankBadge({ myRank }: MyRankBadgeProps) {
  const profit = Math.trunc(myRank.realizedProfit ?? 0)
  const profitColor = profit >= 0 ? 'text-red-500' : 'text-blue-600'

  return (
    <div className="rounded-lg border border-wefin-line bg-wefin-bg/50 px-3 py-2">
      <p className="text-[9px] font-semibold tracking-widest text-wefin-subtle">MY RANK</p>
      <div className="flex items-end justify-between">
        <span className="text-xl font-extrabold leading-none text-wefin-text tabular-nums">
          {String(myRank.rank).padStart(2, '0')}
        </span>
        <span className={`text-sm font-bold tabular-nums ${profitColor}`}>
          {profit >= 0 ? '+' : ''}
          {profit.toLocaleString()}원
        </span>
      </div>
    </div>
  )
}
