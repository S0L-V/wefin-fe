import { Navigate, useParams } from 'react-router-dom'

import { useGameRoomDetailQuery } from '@/features/game-room/model/use-game-room-query'
import { useLeaveRoomGuard } from '@/features/game-room/model/use-leave-room-guard'
import GameWaitingRoom from '@/features/game-room/ui/game-waiting-room'
import LeaveRoomDialog from '@/features/game-room/ui/leave-room-dialog'

function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  // enabled: !!roomId 로 roomId 없으면 API 호출하지 않음
  const { data, isLoading, isError } = useGameRoomDetailQuery(roomId ?? '')
  const guard = useLeaveRoomGuard(roomId ?? '')

  if (!roomId) {
    return <div className="text-center py-20 text-wefin-subtle">잘못된 접근입니다</div>
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] py-8">
        <div className="h-6 w-36 animate-pulse rounded-lg bg-wefin-line" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-wefin-surface-2" />
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="h-48 animate-pulse rounded-2xl bg-wefin-surface shadow-sm" />
            <div className="h-40 animate-pulse rounded-2xl bg-wefin-surface shadow-sm" />
          </div>
          <div className="h-[calc(100dvh-220px)] min-h-[280px] animate-pulse rounded-2xl bg-wefin-surface shadow-sm" />
        </div>
      </div>
    )
  }

  if (isError || !data?.data) {
    return <div className="text-center py-20 text-wefin-subtle">방을 찾을 수 없습니다</div>
  }

  const status = data.data.status

  if (status === 'IN_PROGRESS') {
    return <Navigate to={`/history/room/${roomId}/play`} replace />
  }

  if (status === 'FINISHED') {
    return <Navigate to={`/history/room/${roomId}/result`} replace />
  }

  return (
    <>
      <GameWaitingRoom roomId={roomId} onLeaveRequest={guard.requestLeave} />
      <LeaveRoomDialog
        open={guard.showDialog}
        onConfirm={guard.confirmLeave}
        onCancel={guard.cancelLeave}
        isLeaving={guard.isLeaving}
      />
    </>
  )
}

export default RoomPage
