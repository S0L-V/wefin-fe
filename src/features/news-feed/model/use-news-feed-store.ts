import { create } from 'zustand'

import type { ClusterTab } from '../api/fetch-news-clusters'

interface NewsFeedState {
  tab: ClusterTab
  setTab: (tab: ClusterTab) => void
}

export const useNewsFeedStore = create<NewsFeedState>((set) => ({
  tab: 'ALL',
  setTab: (tab) => set({ tab })
}))
