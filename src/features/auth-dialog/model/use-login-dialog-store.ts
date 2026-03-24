import { create } from 'zustand'

type LoginDialogState = {
  isOpen: boolean
  setOpen: (open: boolean) => void
}

export const useLoginDialogStore = create<LoginDialogState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open })
}))
