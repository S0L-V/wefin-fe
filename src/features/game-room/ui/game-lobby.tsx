import type { RoomListItem } from '../model/game-room.schema'
import { useGameRoomsQuery } from '../model/use-game-room-query'

function GameLobby() {
  const { data, isLoading } = useGameRoomsQuery()

  if (isLoading) {
    return <div className="text-center py-20 text-wefin-subtle">로딩 중...</div>
  }

  const rooms = data?.data ?? []
  const activeRoom = rooms.find(
    (room) => room.status === 'WAITING' || room.status === 'IN_PROGRESS'
  )
  const finishedRooms = rooms.filter((room) => room.status === 'FINISHED')

  return (
    <div className="space-y-8">
      {/* 상단: 제목 + 방 만들기 버튼 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wefin-text">게임 로비</h1>
          <p className="text-wefin-subtle mt-1">그룹 멤버들과 함께 과거의 시장으로 떠나보세요</p>
        </div>
        {!activeRoom && (
          <a
            href="/history/create"
            className="flex items-center gap-2 bg-wefin-mint text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            ▶ 방 만들기
          </a>
        )}
      </div>

      {/* 활성 방 카드 */}
      {activeRoom ? <ActiveRoomCard room={activeRoom} /> : <EmptyRoomCard />}

      {/* 과거 게임 이력 */}
      {finishedRooms.length > 0 && <GameHistorySection rooms={finishedRooms} />}
    </div>
  )
}

function ActiveRoomCard({ room }: { room: RoomListItem }) {
  const statusLabel = room.status === 'WAITING' ? '대기중' : '진행중'

  return (
    <div className="bg-white rounded-2xl border border-wefin-line p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-wefin-mint-soft rounded-xl flex items-center justify-center">
            <span className="text-wefin-mint text-xl">📈</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-wefin-mint text-white px-2 py-0.5 rounded">
                {statusLabel}
              </span>
              <span className="font-semibold text-wefin-text">현재 활성화된 게임</span>
            </div>
            <p className="text-sm text-wefin-subtle mt-1">
              방장: 나 · {room.currentPlayers}명 참여 중
            </p>
          </div>
        </div>
        <a
          href={`/history/room/${room.roomId}`}
          className="bg-wefin-mint text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          입장하기
        </a>
      </div>
    </div>
  )
}

function EmptyRoomCard() {
  return (
    <div className="bg-white rounded-2xl border border-wefin-line border-dashed p-16 text-center">
      <div className="text-4xl mb-4 opacity-30">▶</div>
      <h3 className="text-lg font-semibold text-wefin-text">활성화된 게임이 없습니다</h3>
      <p className="text-wefin-subtle mt-1">새로운 방을 만들어 투자를 시작해보세요</p>
    </div>
  )
}

function GameHistorySection({ rooms }: { rooms: RoomListItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-wefin-line p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-wefin-text">과거 게임 이력</h2>
        <button className="text-sm text-wefin-mint hover:underline">전체보기 &gt;</button>
      </div>
      <div className="space-y-4">
        {rooms.map((room) => (
          <GameHistoryItem key={room.roomId} room={room} />
        ))}
      </div>
    </div>
  )
}

function GameHistoryItem({ room }: { room: RoomListItem }) {
  const seedLabel = `시드 ${(room.seedMoney / 10000).toLocaleString()}만원`
  const periodLabel = `${room.periodMonths}M`

  return (
    <div className="flex items-center justify-between py-3 border-b border-wefin-line last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-1 h-10 bg-green-400 rounded-full" />
        <div>
          <p className="font-medium text-wefin-text">
            {seedLabel} · {periodLabel}
          </p>
          <p className="text-sm text-wefin-subtle">
            {room.startDate} ~ {room.endDate}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-red-500 font-medium">+0.00%</p>
        <p className="text-xs text-wefin-subtle">완료</p>
      </div>
    </div>
  )
}

export default GameLobby
