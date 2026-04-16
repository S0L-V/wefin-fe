import { Heart, TrendingDown, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useToggleWatchlist } from '@/features/watchlist/model/use-watchlist-queries'
import { routes } from '@/shared/config/routes'
import StockLogo from '@/shared/ui/stock-logo'

import type { StockRankingItem } from '../api/fetch-stock-ranking'

interface StockRankingRowProps {
  stock: StockRankingItem
}

function formatTradingValue(won: number): string {
  if (won >= 1_0000_0000_0000) {
    const jo = Math.floor(won / 1_0000_0000_0000)
    const eok = Math.floor((won % 1_0000_0000_0000) / 1_0000_0000)
    return eok > 0 ? `${jo}조 ${eok.toLocaleString()}억원` : `${jo}조원`
  }
  if (won >= 1_0000_0000) return `${(won / 1_0000_0000).toFixed(0)}억원`
  if (won >= 1_0000) return `${(won / 1_0000).toFixed(0)}만원`
  return `${won.toLocaleString()}원`
}

export default function StockRankingRow({ stock }: StockRankingRowProps) {
  const navigate = useNavigate()
  const { isWatchlisted, toggle, isPending } = useToggleWatchlist(stock.stockCode)

  const isUp = stock.changeRate > 0
  const isDown = stock.changeRate < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : null
  const rateTextColor = isUp ? 'text-red-500' : isDown ? 'text-blue-500' : 'text-wefin-subtle'
  const rateBgColor = isUp ? 'bg-red-50' : isDown ? 'bg-blue-50' : 'bg-transparent'
  const signedChangeAmount = `${stock.changeAmount >= 0 ? '+' : ''}${Math.trunc(stock.changeAmount).toLocaleString()}`
  const tradingValue = stock.currentPrice * stock.volume

  const handleRowClick = () => navigate(routes.stockDetail(stock.stockCode))
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
        <StockLogo code={stock.stockCode} name={stock.stockName} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-wefin-text">{stock.stockName}</span>
        <span className="text-xs text-wefin-subtle">{stock.stockCode}</span>
      </div>
      <div className="flex w-32 flex-col items-end">
        <span className="text-base font-semibold text-wefin-text tabular-nums">
          {stock.currentPrice.toLocaleString()}원
        </span>
        <span className={`text-xs font-medium ${rateTextColor} tabular-nums`}>
          {signedChangeAmount}원
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
