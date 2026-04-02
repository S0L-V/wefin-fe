import { useGameRoomsQuery } from './use-game-room-query'

export function useGameLobby() {
  const { data, isLoading } = useGameRoomsQuery()

  const rooms = data?.data ?? []
  const activeRoom = rooms.find(
    (room) => room.status === 'WAITING' || room.status === 'IN_PROGRESS'
  )
  const finishedRooms = rooms.filter((room) => room.status === 'FINISHED')

  return { activeRoom, finishedRooms, isLoading }
}
