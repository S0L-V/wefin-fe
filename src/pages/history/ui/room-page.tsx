import { Navigate, useParams } from 'react-router-dom'

import { useGameRoomDetailQuery } from '@/features/game-room/model/use-game-room-query'
import GameWaitingRoom from '@/features/game-room/ui/game-waiting-room'

function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  // enabled: !!roomId 로 roomId 없으면 API 호출하지 않음
  const { data, isLoading, isError } = useGameRoomDetailQuery(roomId ?? '')

  if (!roomId) {
    return <div className="text-center py-20 text-wefin-subtle">잘못된 접근입니다</div>
  }

  if (isLoading) {
    return <div className="text-center py-20 text-wefin-subtle">로딩 중...</div>
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

  return <GameWaitingRoom roomId={roomId} />
}

export default RoomPage
