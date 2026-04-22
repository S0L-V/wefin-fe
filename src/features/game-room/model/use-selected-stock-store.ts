import { create } from 'zustand'

import type { StockSearchItem } from './stock.schema'

type SelectSource = 'order' | 'holdings'

interface SelectedStockState {
  selectedStock: StockSearchItem | null
  expandedSymbol: string | null
  source: SelectSource | null
  selectStock: (stock: StockSearchItem, source: SelectSource) => void
  clearStock: () => void
}

export const useSelectedStockStore = create<SelectedStockState>((set) => ({
  selectedStock: null,
  expandedSymbol: null,
  source: null,
  selectStock: (stock, source) =>
    set({ selectedStock: stock, expandedSymbol: stock.symbol, source }),
  clearStock: () => set({ selectedStock: null, expandedSymbol: null, source: null })
}))
