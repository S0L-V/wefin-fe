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
  const { isWatchlisted, toggle, isPending } = useToggleWatchlist(stock.stockCode, stock.stockName)

  const isUp = stock.changeRate > 0
  const isDown = stock.changeRate < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : null
  const rateTextColor = isUp ? 'text-wefin-red' : isDown ? 'text-wefin-blue' : 'text-wefin-subtle'
  const rateBgColor = isUp ? 'bg-wefin-red-soft' : isDown ? 'bg-wefin-surface-2' : 'bg-transparent'
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
      className="flex cursor-pointer items-center px-4 py-3.5 transition-colors hover:bg-wefin-bg sm:px-7 sm:py-5"
    >
      <button
        type="button"
        onClick={handleHeartClick}
        disabled={isPending}
        className={`mr-2 hidden rounded-md p-1 transition-colors sm:block ${
          isWatchlisted
            ? 'text-rose-500 hover:text-rose-600'
            : 'text-wefin-subtle hover:text-rose-400'
        } ${isPending ? 'opacity-50' : ''}`}
        aria-label={isWatchlisted ? '관심종목 해제' : '관심종목 추가'}
      >
        <Heart className={`h-5.5 w-5.5 ${isWatchlisted ? 'fill-current' : ''}`} />
      </button>
      <div className="w-7 text-[14px] font-extrabold text-wefin-text sm:w-10 sm:text-[17px]">
        {stock.rank}
      </div>
      <div className="mr-2.5 hidden sm:block sm:mr-4">
        <StockLogo code={stock.stockCode} name={stock.stockName} size={40} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[14px] font-bold text-wefin-text sm:text-[16px]">
          {stock.stockName}
        </span>
        <span className="hidden text-[13px] text-wefin-subtle sm:block">{stock.stockCode}</span>
      </div>
      <div className="flex w-auto flex-col items-end sm:w-40">
        <span className="font-num text-[14px] font-bold text-wefin-text tabular-nums sm:text-[17px]">
          {stock.currentPrice.toLocaleString()}원
        </span>
        <span
          className={`font-num hidden text-[13.5px] font-medium sm:block ${rateTextColor} tabular-nums`}
        >
          {signedChangeAmount}원
        </span>
      </div>
      <div className="ml-2 flex w-auto justify-end sm:ml-0 sm:w-36">
        <span
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold tabular-nums sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[15px] ${rateTextColor} ${rateBgColor}`}
        >
          {TrendIcon && <TrendIcon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />}
          {isUp ? '+' : ''}
          {stock.changeRate.toFixed(2)}%
        </span>
      </div>
      <div className="font-num ml-2 w-auto text-right text-[12px] font-semibold text-wefin-text tabular-nums sm:ml-0 sm:w-40 sm:text-[15px]">
        {formatTradingValue(tradingValue)}
      </div>
      <div className="font-num hidden w-40 text-right text-[15px] text-wefin-subtle tabular-nums sm:block">
        {stock.volume.toLocaleString()}
      </div>
    </div>
  )
}
