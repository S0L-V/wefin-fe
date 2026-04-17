import { useGameHistoryQuery, useGameRoomsQuery } from './use-game-room-query'

export function useGameLobby() {
  const { data: roomsData, isLoading: roomsLoading } = useGameRoomsQuery()
  const { data: historyData, isLoading: historyLoading } = useGameHistoryQuery(0, 3)

  const rooms = roomsData?.data ?? []
  const activeRoom = rooms.find(
    (room) => room.status === 'WAITING' || room.status === 'IN_PROGRESS'
  )

  const recentHistory = historyData?.data.content ?? []

  return {
    activeRoom,
    recentHistory,
    isLoading: roomsLoading || historyLoading
  }
}
