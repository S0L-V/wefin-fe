import { create } from 'zustand'

import type { StockSearchItem } from './stock.schema'

interface SelectedStockState {
  selectedStock: StockSearchItem | null
  selectStock: (stock: StockSearchItem) => void
  clearStock: () => void
}

export const useSelectedStockStore = create<SelectedStockState>((set) => ({
  selectedStock: null,
  selectStock: (stock) => set({ selectedStock: stock }),
  clearStock: () => set({ selectedStock: null })
}))
