import { create } from 'zustand'

interface GameFinishedState {
  isGameFinished: boolean
  setGameFinished: () => void
  resetGameFinished: () => void
}

export const useGameFinishedStore = create<GameFinishedState>((set) => ({
  isGameFinished: false,
  setGameFinished: () => set({ isGameFinished: true }),
  resetGameFinished: () => set({ isGameFinished: false })
}))
