import { Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'

import ChatPanel from '@/features/chat/ui/chat-panel'
import DailyQuestPanel from '@/features/quest/ui/daily-quest-panel'
import type { StockRankingItem } from '@/features/stock-ranking/api/fetch-stock-ranking'
import { useStockRankingQuery } from '@/features/stock-ranking/model/use-stock-ranking-query'

type SidebarTab = 'ranking' | 'chat'

const TABS: { key: SidebarTab; label: string }[] = [
  { key: 'ranking', label: '거래대금' },
  { key: 'chat', label: '채팅' }
]

function StockRankingList() {
  const { data, isLoading, isError } = useStockRankingQuery('amount', 20)

  if (isLoading) {
    return (
      <div className="space-y-3 px-5 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-3">
            <div className="h-4 w-5 rounded bg-wefin-surface-2" />
            <div className="h-4 flex-1 rounded bg-wefin-surface-2" />
            <div className="h-4 w-16 rounded bg-wefin-surface-2" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="py-8 text-center text-xs text-wefin-subtle">랭킹을 불러올 수 없어요</p>
  }

  const items: StockRankingItem[] = data ?? []

  if (items.length === 0) {
    return <p className="py-8 text-center text-xs text-wefin-subtle">데이터가 없어요</p>
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 scrollbar-thin">
      {items.map((item, idx) => {
        const isTop3 = item.rank <= 3
        const isPositive = item.changeRate > 0
        const isNegative = item.changeRate < 0
        const sign = isPositive ? '+' : ''

        return (
          <div
            key={item.stockCode}
            className={`group grid grid-cols-[28px_1fr_auto] items-center gap-3 py-3 ${
              idx < items.length - 1 ? 'border-b border-dashed border-wefin-line' : ''
            }`}
          >
            <span
              className={`font-num text-[16px] font-[800] ${
                isTop3 ? 'text-wefin-mint' : 'text-wefin-muted'
              }`}
            >
              {item.rank}
            </span>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-wefin-text transition-colors group-hover:text-wefin-mint-deep">
                {item.stockName}
              </p>
              <p className="text-[11.5px] text-wefin-muted">{item.stockCode}</p>
            </div>

            <div className="text-right">
              <p className="font-num text-[15px] font-bold text-wefin-text">
                {item.currentPrice.toLocaleString('ko-KR')}
              </p>
              <p
                className={`font-num text-[12.5px] font-semibold ${
                  isPositive
                    ? 'text-wefin-red'
                    : isNegative
                      ? 'text-wefin-blue'
                      : 'text-wefin-muted'
                }`}
              >
                {sign}
                {item.changeRate.toFixed(2)}%
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function HomeSidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('ranking')
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="shrink-0 overflow-hidden">
        <DailyQuestPanel />
      </div>

      <div
        className={`card-base flex min-h-0 flex-col overflow-hidden transition-all duration-300 ${
          expanded
            ? 'fixed right-6 bottom-6 z-30 h-[calc(100vh-100px)] w-[min(420px,calc(100vw-48px))] shadow-[0_16px_48px_rgba(0,0,0,0.12)]'
            : 'flex-1 min-h-0'
        }`}
      >
        <div className="flex items-center gap-2 p-2.5">
          <div className="flex flex-1 gap-1 rounded-full bg-wefin-surface-2 p-1">
            {TABS.map(({ key, label }) => {
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-wefin-surface text-wefin-text shadow-sm'
                      : 'text-wefin-subtle hover:text-wefin-text'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {activeTab === 'chat' && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-surface-2 hover:text-wefin-text"
              aria-label={expanded ? '채팅 축소' : '채팅 확대'}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activeTab === 'ranking' && <StockRankingList />}
          {activeTab === 'chat' && <ChatPanel />}
        </div>
      </div>
    </div>
  )
}
