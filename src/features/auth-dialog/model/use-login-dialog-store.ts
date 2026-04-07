import { create } from 'zustand'

export type AuthDialogMode = 'login' | 'signup'

type LoginDialogState = {
  isOpen: boolean
  mode: AuthDialogMode
  setOpen: (open: boolean) => void
  openLogin: () => void
  openSignup: () => void
  switchMode: (mode: AuthDialogMode) => void
  close: () => void
}

export const useLoginDialogStore = create<LoginDialogState>((set) => ({
  isOpen: false,
  mode: 'login',
  setOpen: (open) => set({ isOpen: open }),
  openLogin: () => set({ isOpen: true, mode: 'login' }),
  openSignup: () => set({ isOpen: true, mode: 'signup' }),
  switchMode: (mode) => set({ mode }),
  close: () => set({ isOpen: false })
}))
