import { useState } from 'react'

import StockRankingTable from '@/features/stock-ranking/ui/stock-ranking-table'
import StockSearchModal from '@/features/stock-search/ui/stock-search-modal'
import StockLayout from '@/widgets/stock-layout/ui/stock-layout'

function StocksPage() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <StockLayout>
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <StockRankingTable onSearchClick={() => setSearchOpen(true)} />
      </section>

      <StockSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </StockLayout>
  )
}

export default StocksPage
