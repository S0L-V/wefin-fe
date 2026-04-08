import { useParams } from 'react-router-dom'

import { useLeaveRoomGuard } from '@/features/game-room/model/use-leave-room-guard'
import LeaveRoomDialog from '@/features/game-room/ui/leave-room-dialog'

function PlayPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const guard = useLeaveRoomGuard(roomId ?? '')

  if (!roomId) {
    return <div className="text-center py-20 text-wefin-subtle">잘못된 접근입니다</div>
  }

  return (
    <>
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-wefin-text mb-2">게임 진행 중</h2>
        <p className="text-wefin-subtle">게임 진행 페이지는 준비 중입니다.</p>
      </div>
      <LeaveRoomDialog
        open={guard.showDialog}
        onConfirm={guard.confirmLeave}
        onCancel={guard.cancelLeave}
        isLeaving={guard.isLeaving}
      />
    </>
  )
}

export default PlayPage
