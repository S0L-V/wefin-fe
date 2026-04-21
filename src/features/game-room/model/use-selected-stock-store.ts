import { create } from 'zustand'

import type { StockSearchItem } from './stock.schema'

interface SelectedStockState {
  selectedStock: StockSearchItem | null
  expandedSymbol: string | null
  selectStock: (stock: StockSearchItem) => void
  clearStock: () => void
}

export const useSelectedStockStore = create<SelectedStockState>((set) => ({
  selectedStock: null,
  expandedSymbol: null,
  selectStock: (stock) => set({ selectedStock: stock, expandedSymbol: stock.symbol }),
  clearStock: () => set({ selectedStock: null, expandedSymbol: null })
}))
