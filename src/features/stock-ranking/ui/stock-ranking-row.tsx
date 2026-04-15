import { Heart, TrendingDown, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useToggleWatchlist } from '@/features/watchlist/model/use-watchlist-queries'
import { routes } from '@/shared/config/routes'
import StockLogo from '@/shared/ui/stock-logo'

import type { RankingStock } from '../lib/ranking-data'

interface StockRankingRowProps {
  stock: RankingStock
}

function formatTradingValue(won: number): string {
  if (won >= 1_0000_0000) return `${(won / 1_0000_0000).toFixed(0)}억원`
  if (won >= 1_0000) return `${(won / 1_0000).toFixed(0)}만원`
  return `${won.toLocaleString()}원`
}

export default function StockRankingRow({ stock }: StockRankingRowProps) {
  const navigate = useNavigate()
  const { isWatchlisted, toggle, isPending } = useToggleWatchlist(stock.code)

  const isUp = stock.changeRate > 0
  const isDown = stock.changeRate < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : null
  const rateTextColor = isUp ? 'text-red-500' : isDown ? 'text-blue-500' : 'text-wefin-subtle'
  const rateBgColor = isUp ? 'bg-red-50' : isDown ? 'bg-blue-50' : 'bg-transparent'
  const changeValue = Math.trunc((stock.price * stock.changeRate) / 100)
  const signedChangeValue = `${changeValue >= 0 ? '+' : ''}${changeValue.toLocaleString()}`
  const tradingValue = stock.price * stock.volume

  const handleRowClick = () => navigate(routes.stockDetail(stock.code))
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggle()
  }

  return (
    <div
      onClick={handleRowClick}
      className="flex cursor-pointer items-center px-5 py-3.5 transition-colors hover:bg-wefin-bg"
    >
      <button
        type="button"
        onClick={handleHeartClick}
        disabled={isPending}
        className={`mr-2 rounded-md p-1 transition-colors ${
          isWatchlisted ? 'text-red-500 hover:text-red-600' : 'text-wefin-subtle hover:text-red-400'
        } ${isPending ? 'opacity-50' : ''}`}
        aria-label={isWatchlisted ? '관심종목 해제' : '관심종목 추가'}
      >
        <Heart className={`h-4 w-4 ${isWatchlisted ? 'fill-current' : ''}`} />
      </button>
      <div className="w-8 text-sm font-semibold text-wefin-text">{stock.rank}</div>
      <div className="mr-3">
        <StockLogo code={stock.code} name={stock.name} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-wefin-text">{stock.name}</span>
        <span className="text-xs text-wefin-subtle">{stock.code}</span>
      </div>
      <div className="flex w-32 flex-col items-end">
        <span className="text-base font-semibold text-wefin-text tabular-nums">
          {stock.price.toLocaleString()}원
        </span>
        <span className={`text-xs font-medium ${rateTextColor} tabular-nums`}>
          {signedChangeValue}원
        </span>
      </div>
      <div className="flex w-28 justify-end">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium tabular-nums ${rateTextColor} ${rateBgColor}`}
        >
          {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
          {isUp ? '+' : ''}
          {stock.changeRate.toFixed(2)}%
        </span>
      </div>
      <div className="w-32 text-right text-sm font-medium text-wefin-text tabular-nums">
        {formatTradingValue(tradingValue)}
      </div>
      <div className="w-32 text-right text-sm text-wefin-subtle tabular-nums">
        {stock.volume.toLocaleString()}
      </div>
    </div>
  )
}
