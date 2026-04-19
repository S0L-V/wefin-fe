import { create } from 'zustand'

export interface RankChange {
  userName: string
  prevRank: number
  newRank: number
  /** 양수면 상승, 음수면 하락 */
  delta: number
}

interface RankChangeState {
  rankChanges: RankChange[]
  setRankChanges: (changes: RankChange[]) => void
  clearRankChanges: () => void
}

export const useRankChangeStore = create<RankChangeState>((set) => ({
  rankChanges: [],
  setRankChanges: (changes) => set({ rankChanges: changes }),
  clearRankChanges: () => set({ rankChanges: [] })
}))
