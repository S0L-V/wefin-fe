import { create } from 'zustand'

interface VoteState {
  isVoting: boolean
  initiator: string | null
  agreeCount: number
  disagreeCount: number
  totalCount: number
  timeoutSeconds: number
  result: 'passed' | 'rejected' | null
  hasVoted: boolean

  startVote: (initiator: string, totalCount: number, timeoutSeconds: number) => void
  updateVote: (agreeCount: number, disagreeCount: number, totalCount: number) => void
  finishVote: (passed: boolean, agreeCount: number, disagreeCount: number) => void
  markVoted: () => void
  reset: () => void
}

const initialState = {
  isVoting: false,
  initiator: null,
  agreeCount: 0,
  disagreeCount: 0,
  totalCount: 0,
  timeoutSeconds: 0,
  result: null as 'passed' | 'rejected' | null,
  hasVoted: false
}

export const useVoteStore = create<VoteState>((set) => ({
  ...initialState,

  startVote: (initiator, totalCount, timeoutSeconds) =>
    set((state) => ({
      isVoting: true,
      initiator,
      totalCount,
      timeoutSeconds,
      agreeCount: 0,
      disagreeCount: 0,
      result: null,
      hasVoted: state.hasVoted
    })),

  updateVote: (agreeCount, disagreeCount, totalCount) =>
    set({ agreeCount, disagreeCount, totalCount }),

  finishVote: (passed, agreeCount, disagreeCount) =>
    set({
      result: passed ? 'passed' : 'rejected',
      agreeCount,
      disagreeCount
    }),

  markVoted: () => set({ hasVoted: true }),

  reset: () => set(initialState)
}))
