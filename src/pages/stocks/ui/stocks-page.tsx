import { useEffect, useState } from 'react'

import type { RankingTab } from '@/features/stock-ranking/lib/ranking-data'
import StockRankingControls from '@/features/stock-ranking/ui/stock-ranking-controls'
import StockRankingTable from '@/features/stock-ranking/ui/stock-ranking-table'
import StockSearchModal from '@/features/stock-search/ui/stock-search-modal'
import SeoHead from '@/shared/ui/seo-head'
import StockLayout from '@/widgets/stock-layout/ui/stock-layout'

function StocksPage() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<RankingTab>('amount')

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== '/') return
      const target = e.target as HTMLElement | null
      if (target?.matches('input, textarea, [contenteditable="true"]')) return
      e.preventDefault()
      setSearchOpen(true)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <StockLayout>
      <SeoHead
        title="실시간 투자"
        description="실시간 거래 랭킹과 모의투자를 경험하세요."
        path="/stocks"
      />
      <div className="flex h-[calc(100dvh-108px)] flex-col gap-2">
        <div className="shrink-0 rounded-2xl bg-wefin-surface p-5">
          <StockRankingControls
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSearchClick={() => setSearchOpen(true)}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-wefin-surface">
          <StockRankingTable activeTab={activeTab} />
        </div>
      </div>

      <StockSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </StockLayout>
  )
}

export default StocksPage
