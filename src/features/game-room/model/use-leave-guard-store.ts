import { create } from 'zustand'

interface LeaveGuardState {
  /** 게임방 페이지에 있는지 여부 */
  active: boolean
  /** 현재 방 ID */
  roomId: string
  /** 이탈 확인 모달 표시 여부 */
  showDialog: boolean
  /** 사용자가 이동하려던 경로 */
  pendingPath: string | null

  activate: (roomId: string) => void
  deactivate: () => void
  requestLeave: (path?: string) => void
  cancelLeave: () => void
  getPendingPath: () => string | null
  clearPendingPath: () => void
}

export const useLeaveGuardStore = create<LeaveGuardState>((set, get) => ({
  active: false,
  roomId: '',
  showDialog: false,
  pendingPath: null,

  activate: (roomId) => set({ active: true, roomId }),
  deactivate: () => set({ active: false, roomId: '', showDialog: false, pendingPath: null }),
  requestLeave: (path) => set({ showDialog: true, pendingPath: path ?? null }),
  cancelLeave: () => set({ showDialog: false, pendingPath: null }),
  getPendingPath: () => get().pendingPath,
  clearPendingPath: () => set({ pendingPath: null })
}))
