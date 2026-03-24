import { create } from 'zustand'

type UiState = {
  isLoginDialogOpen: boolean
  setLoginDialogOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  isLoginDialogOpen: false,
  setLoginDialogOpen: (open) => set({ isLoginDialogOpen: open })
}))
