import type { RankingItem } from '../api/fetch-user-ranking'

interface RankingRowProps {
  item: RankingItem
}

export default function RankingRow({ item }: RankingRowProps) {
  const profit = Math.trunc(item.realizedProfit ?? 0)
  const profitColor = profit >= 0 ? 'text-wefin-red' : 'text-wefin-blue'
  const isFirst = item.rank === 1

  if (isFirst) {
    return (
      <div className="mb-2 rounded-xl bg-gradient-to-r from-[#0a2e2f] to-[#143d3e] px-4 py-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold tabular-nums tracking-tight text-white/80">
              01
            </span>
            <div>
              <p className="text-base font-bold">{item.nickname ?? '-'}</p>
              <p className="text-xs text-white/45">{item.tradeCount}회 거래</p>
            </div>
          </div>
          <span className="text-lg font-bold tabular-nums text-emerald-300">
            {profit >= 0 ? '+' : ''}
            {profit.toLocaleString()}
          </span>
        </div>
      </div>
    )
  }

  const isTop3 = item.rank <= 3

  return (
    <div className={`flex items-center py-2 ${isTop3 ? '' : ''}`}>
      <span
        className={`w-7 text-center tabular-nums ${isTop3 ? 'text-sm font-bold text-wefin-mint-deep' : 'text-xs font-bold text-wefin-muted'}`}
      >
        {String(item.rank).padStart(2, '0')}
      </span>
      <span
        className={`min-w-0 flex-1 truncate ${isTop3 ? 'text-sm font-semibold text-wefin-text' : 'text-xs text-wefin-text'}`}
      >
        {item.nickname ?? '-'}
      </span>
      <span
        className={`shrink-0 tabular-nums ${isTop3 ? 'text-sm font-semibold' : 'text-xs'} ${profitColor}`}
      >
        {profit >= 0 ? '+' : ''}
        {profit.toLocaleString()}
      </span>
    </div>
  )
}
