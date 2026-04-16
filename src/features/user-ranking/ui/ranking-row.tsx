import { Trophy } from 'lucide-react'

import type { RankingItem } from '../api/fetch-user-ranking'

interface RankingRowProps {
  item: RankingItem
}

const TROPHY_COLOR: Record<number, string> = {
  1: 'text-amber-500',
  2: 'text-slate-400',
  3: 'text-orange-700'
}

export default function RankingRow({ item }: RankingRowProps) {
  const profit = item.realizedProfit ?? 0
  const profitColor = profit >= 0 ? 'text-red-500' : 'text-blue-500'
  const trophyColor = TROPHY_COLOR[item.rank]

  return (
    <div className="flex items-center gap-3 py-3 text-sm">
      <span className="flex w-10 items-center gap-1 font-semibold text-wefin-text">
        {trophyColor && <Trophy className={`h-3.5 w-3.5 ${trophyColor}`} />}
        {item.rank}
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
