import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiError } from '@/shared/api/base-api'

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

  // leave 성공 시 리다이렉트
  // deactivate는 컴포넌트 언마운트 cleanup이 처리하므로 여기서는 navigate만
  useEffect(() => {
    if (leaveMutation.isSuccess) {
      navigate(pendingPathRef.current ?? '/history')
    }
  }, [leaveMutation.isSuccess, navigate])

  const confirmLeave = useCallback(() => {
    pendingPathRef.current = getPendingPath()
    leaveMutation.mutate(roomId, {
      onError: (err) => {
        // 실패 시: 다이얼로그 닫고 사용자에게 에러 표시
        // 재시도는 다시 로고/메뉴 클릭으로 유도. 다이얼로그를 열어두면
        // 사용자가 뭐가 실패했는지 모른 채 같은 버튼을 반복 누르게 됨.
        const message =
          err instanceof ApiError
            ? err.message
            : '방 나가기에 실패했습니다. 잠시 후 다시 시도해주세요.'
        cancelLeave()
        toast.error(message)
      }
    })
  }, [roomId, leaveMutation, getPendingPath, cancelLeave])

  return {
    showDialog,
    confirmLeave,
    cancelLeave,
    requestLeave,
    isLeaving: leaveMutation.isPending
  }
}
