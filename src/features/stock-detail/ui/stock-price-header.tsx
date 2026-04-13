import { ChevronLeft, Heart, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { PriceData } from '@/features/stock-detail/api/fetch-stock-detail'
import {
  useStockInfoQuery,
  useStockPriceQuery
} from '@/features/stock-detail/model/use-stock-detail-queries'
import StockSearchModal from '@/features/stock-search/ui/stock-search-modal'
import { useToggleWatchlist } from '@/features/watchlist/model/use-watchlist-queries'

export type DetailTab = 'chart' | 'info' | 'news'

interface StockPriceHeaderProps {
  code: string
  activeTab: DetailTab
  onTabChange: (tab: DetailTab) => void
}

const tabs: { key: DetailTab; label: string }[] = [
  { key: 'chart', label: '차트·호가' },
  { key: 'info', label: '종목정보' },
  { key: 'news', label: '뉴스·공시' }
]

export default function StockPriceHeader({ code, activeTab, onTabChange }: StockPriceHeaderProps) {
  const navigate = useNavigate()
  const { data: stockInfo } = useStockInfoQuery(code)
  const { data: price, isLoading } = useStockPriceQuery(code)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isWatchlisted, toggle, isPending } = useToggleWatchlist(code)

  return (
    <>
      <div className="space-y-1.5">
        {/* 1행: 뒤로가기 + 종목명 + 코드 + 관심 ... 검색 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(-1)}
              className="rounded-md p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="뒤로가기"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {isLoading ? (
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            ) : (
              <>
                <h1 className="text-base font-bold text-wefin-text">
                  {stockInfo?.stockName ?? code}
                </h1>
                <span className="text-xs text-wefin-subtle">{code}</span>
              </>
            )}

            <button
              onClick={toggle}
              disabled={isPending}
              className={`rounded-md p-0.5 transition-colors ${
                isWatchlisted
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-300 hover:text-red-400'
              } ${isPending ? 'opacity-50' : ''}`}
              aria-label={isWatchlisted ? '관심종목 해제' : '관심종목 추가'}
            >
              <Heart className={`h-4 w-4 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-52 items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs text-wefin-subtle transition-colors hover:bg-gray-200"
          >
            <Search className="h-3.5 w-3.5" />
            종목명, 코드, 분야를 검색하세요
          </button>
        </div>

        {/* 2행: 현재가 + 등락 */}
        {isLoading ? (
          <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
        ) : price ? (
          <PriceDisplay price={price} />
        ) : null}

        {/* 3행: 탭 */}
        <div className="flex gap-3 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`pb-2 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-wefin-text text-wefin-text'
                  : 'text-wefin-subtle hover:text-wefin-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <StockSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function PriceDisplay({ price }: { price: PriceData }) {
  const isPositive = price.changePrice > 0
  const isNegative = price.changePrice < 0
  const colorClass = isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : 'text-gray-600'
  const sign = isPositive ? '+' : ''

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-wefin-text">
        {price.currentPrice.toLocaleString()}원
      </span>
      <span className={`flex items-center gap-0.5 text-xs font-medium ${colorClass}`}>
        {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
        {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
        {sign}
        {price.changePrice.toLocaleString()}원 ({sign}
        {price.changeRate.toFixed(2)}%)
      </span>
    </div>
  )
}
