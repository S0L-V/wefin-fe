import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLeaveGameRoomMutation } from './use-game-room-query'
import { useLeaveGuardStore } from './use-leave-guard-store'

export function useLeaveRoomGuard(roomId: string) {
  const navigate = useNavigate()
  const leaveMutation = useLeaveGameRoomMutation()
  const pendingPathRef = useRef<string | null>(null)

  const showDialog = useLeaveGuardStore((s) => s.showDialog)
  const activate = useLeaveGuardStore((s) => s.activate)
  const deactivate = useLeaveGuardStore((s) => s.deactivate)
  const cancelLeave = useLeaveGuardStore((s) => s.cancelLeave)
  const requestLeave = useLeaveGuardStore((s) => s.requestLeave)
  const getPendingPath = useLeaveGuardStore((s) => s.getPendingPath)

  // 마운트 시 가드 활성화, 언마운트 시 비활성화
  useEffect(() => {
    activate(roomId)
    return () => deactivate()
  }, [roomId, activate, deactivate])

  // 브라우저 탭 닫기 / 새로고침 차단
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // leave 성공 시 리다이렉트
  // deactivate는 컴포넌트 언마운트 cleanup이 처리하므로 여기서는 navigate만
  useEffect(() => {
    if (leaveMutation.isSuccess) {
      navigate(pendingPathRef.current ?? '/history')
    }
  }, [leaveMutation.isSuccess, navigate])

  const confirmLeave = useCallback(() => {
    pendingPathRef.current = getPendingPath()
    leaveMutation.mutate(roomId)
  }, [roomId, leaveMutation, getPendingPath])

  return {
    showDialog,
    confirmLeave,
    cancelLeave,
    requestLeave,
    isLeaving: leaveMutation.isPending
  }
}
