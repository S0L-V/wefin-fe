import { create } from 'zustand'

import type { ClusterItem, ClusterTab } from '../api/fetch-news-clusters'

interface NewsFeedState {
  tab: ClusterTab
  cursors: (string | null)[]
  loadedItems: ClusterItem[]
  expanded: boolean
  setTab: (tab: ClusterTab) => void
  setCursors: (updater: (prev: (string | null)[]) => (string | null)[]) => void
  setLoadedItems: (items: ClusterItem[]) => void
  setExpanded: (expanded: boolean) => void
  resetPagination: () => void
}

export const useNewsFeedStore = create<NewsFeedState>((set) => ({
  tab: 'ALL',
  cursors: [null],
  loadedItems: [],
  expanded: false,
  setTab: (tab) => set({ tab }),
  setCursors: (updater) => set((state) => ({ cursors: updater(state.cursors) })),
  setLoadedItems: (loadedItems) => set({ loadedItems }),
  setExpanded: (expanded) => set({ expanded }),
  resetPagination: () => set({ cursors: [null], loadedItems: [], expanded: false })
}))
