import { Search } from 'lucide-react'

import SegmentedTabs from '@/shared/ui/segmented-tabs'

import { RANKING_TABS, type RankingTab } from '../lib/ranking-data'

interface StockRankingControlsProps {
  activeTab: RankingTab
  onTabChange: (tab: RankingTab) => void
  onSearchClick: () => void
}

export default function StockRankingControls({
  activeTab,
  onTabChange,
  onSearchClick
}: StockRankingControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="shrink-0 text-lg font-bold text-wefin-text sm:text-xl">실시간 거래 랭킹</h1>
        <button
          onClick={onSearchClick}
          className="flex min-w-0 items-center gap-2 rounded-lg bg-wefin-surface-2 px-3 py-2 text-sm text-wefin-subtle transition-colors hover:bg-wefin-line"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden items-center gap-1 sm:flex">
            <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-wefin-line bg-wefin-surface px-1.5 font-mono text-xs text-wefin-subtle">
              /
            </kbd>
            를 눌러 검색하세요
          </span>
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <SegmentedTabs
          items={RANKING_TABS}
          activeKey={activeTab}
          onChange={onTabChange}
          size="md"
        />
      </div>
    </div>
  )
}
