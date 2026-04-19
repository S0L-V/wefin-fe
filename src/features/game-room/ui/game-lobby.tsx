import { Play, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import type { GameHistoryItem, RoomListItem } from '../model/game-room.schema'
import { useGameLobby } from '../model/use-game-lobby'
import { useJoinGameRoomMutation } from '../model/use-game-room-query'

function GameLobby() {
  const { activeRoom, recentHistory, isLoading } = useGameLobby()

  if (isLoading) {
    return <div className="text-center py-20 text-wefin-subtle">로딩 중...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wefin-text">게임 로비</h1>
          <p className="text-wefin-subtle mt-1">그룹 멤버들과 함께 과거의 시장으로 떠나보세요</p>
        </div>
        {!activeRoom && (
          <Link
            to="/history/create"
            className="flex items-center gap-2 bg-wefin-mint text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <Play className="w-4 h-4" />방 만들기
          </Link>
        )}
      </div>

      {activeRoom ? <ActiveRoomCard room={activeRoom} /> : <EmptyRoomCard />}

      {recentHistory.length > 0 && <GameHistorySection items={recentHistory} />}
    </div>
  )
}

function ActiveRoomCard({ room }: { room: RoomListItem }) {
  const navigate = useNavigate()
  const joinMutation = useJoinGameRoomMutation()
  const statusLabel = room.status === 'WAITING' ? '대기중' : '진행중'

  function handleEnter() {
    joinMutation.mutate(room.roomId, {
      onSuccess: () => navigate(`/history/room/${room.roomId}`),
      onError: (error) => {
        if (error instanceof Error && 'code' in error && error.code === 'ROOM_ALREADY_JOINED') {
          navigate(`/history/room/${room.roomId}`)
        }
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'PARTICIPANT_ALREADY_FINISHED'
        ) {
          alert('이미 종료한 게임입니다. 다른 플레이어의 게임이 끝나면 결과를 확인할 수 있습니다.')
        }
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-wefin-line p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-wefin-mint-soft rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-wefin-mint" />
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
        <button
          onClick={handleEnter}
          disabled={joinMutation.isPending}
          className="bg-wefin-mint text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {joinMutation.isPending ? '입장 중...' : '입장하기'}
        </button>
      </div>
    </div>
  )
}

function EmptyRoomCard() {
  return (
    <div className="bg-white rounded-2xl border border-wefin-line border-dashed p-16 text-center">
      <Play className="w-10 h-10 mx-auto mb-4 opacity-30 text-wefin-subtle" />
      <h3 className="text-lg font-semibold text-wefin-text">활성화된 게임이 없습니다</h3>
      <p className="text-wefin-subtle mt-1">새로운 방을 만들어 투자를 시작해보세요</p>
    </div>
  )
}

function GameHistorySection({ items }: { items: GameHistoryItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-wefin-line p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-wefin-text">과거 게임 이력</h2>
        <Link to="/history/archive" className="text-sm text-wefin-mint hover:underline">
          전체보기 &gt;
        </Link>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <GameHistoryCard key={item.roomId} item={item} />
        ))}
      </div>
    </div>
  )
}

function GameHistoryCard({ item }: { item: GameHistoryItem }) {
  const seedLabel = `시드 ${(item.seedMoney / 10000).toLocaleString()}만원`
  const periodLabel = `${item.periodMonths}M`
  const isPositive = item.profitRate >= 0
  const profitColor = isPositive ? 'text-red-500' : 'text-blue-500'
  const profitSign = isPositive ? '+' : ''
  const rankLabel = item.finalRank != null ? `${item.finalRank}등` : '-'

  return (
    <Link
      to={`/history/room/${item.roomId}/result`}
      className="flex items-center justify-between py-3 border-b border-wefin-line last:border-b-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-1 h-10 bg-green-400 rounded-full" />
        <div>
          <p className="font-medium text-wefin-text">
            {seedLabel} · {periodLabel} · {item.participantCount}명
          </p>
          <p className="text-sm text-wefin-subtle">
            {item.startDate} ~ {item.endDate}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${profitColor}`}>
          {profitSign}
          {item.profitRate.toFixed(2)}%
        </p>
        <p className="text-xs text-wefin-subtle">
          {rankLabel} / {item.participantCount}명
        </p>
      </div>
    </Link>
  )
}

export default GameLobby
