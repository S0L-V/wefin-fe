import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiError } from '@/shared/api/base-api'

import { useLeaveGameRoomMutation } from './use-game-room-query'
import { useLeaveGuardStore } from './use-leave-guard-store'

export function useLeaveRoomGuard(roomId: string) {
  const navigate = useNavigate()
  const leaveMutation = useLeaveGameRoomMutation()

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

  // 브라우저 뒤로가기 / 앞으로가기 차단
  useEffect(() => {
    // 현재 위치를 history에 한 번 더 push해서 뒤로가기 시 같은 페이지에 머무르게 함
    window.history.pushState(null, '', window.location.href)

    function handlePopState() {
      // 뒤로가기가 발생하면 다시 push해서 페이지 이탈 방지
      window.history.pushState(null, '', window.location.href)
      requestLeave()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [requestLeave])

  // 브라우저 탭 닫기 / 새로고침 차단
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const confirmLeave = useCallback(() => {
    const pending = getPendingPath()
    const targetPath = typeof pending === 'string' ? pending : '/history'
    leaveMutation.mutate(roomId, {
      onSuccess: () => {
        deactivate()
        navigate(targetPath)
      },
      onError: (err) => {
        const message =
          err instanceof ApiError
            ? err.message
            : '방 나가기에 실패했습니다. 잠시 후 다시 시도해주세요.'
        cancelLeave()
        toast.error(message)
      }
    })
  }, [roomId, leaveMutation, getPendingPath, deactivate, navigate, cancelLeave])

  return {
    showDialog,
    confirmLeave,
    cancelLeave,
    requestLeave,
    isLeaving: leaveMutation.isPending
  }
}
