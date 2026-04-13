import { create } from 'zustand'

import type { ClusterItem } from '../api/fetch-news-clusters'
import type { PopularTag } from '../api/fetch-popular-tags'
import type { FilterMode } from '../ui/news-filter-bar'

interface NewsListState {
  mode: FilterMode
  selectedTags: PopularTag[]
  cursors: (string | null)[]
  loadedItems: ClusterItem[]
  setMode: (mode: FilterMode) => void
  setSelectedTags: (tags: PopularTag[]) => void
  setCursors: (updater: (prev: (string | null)[]) => (string | null)[]) => void
  setLoadedItems: (items: ClusterItem[]) => void
  resetPagination: () => void
}

export const useNewsListStore = create<NewsListState>((set) => ({
  mode: 'ALL',
  selectedTags: [],
  cursors: [null],
  loadedItems: [],
  setMode: (mode) => set({ mode }),
  setSelectedTags: (selectedTags) => set({ selectedTags }),
  setCursors: (updater) => set((state) => ({ cursors: updater(state.cursors) })),
  setLoadedItems: (loadedItems) => set({ loadedItems }),
  resetPagination: () => set({ cursors: [null], loadedItems: [] })
}))
