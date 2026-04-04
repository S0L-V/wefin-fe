import { ArrowLeft, MessageCircle, Play, Send } from 'lucide-react'

import type { ParticipantDetail } from '../model/game-room.schema'
import { useGameRoomSocket } from '../model/use-game-room-socket'
import { useWaitingRoom } from '../model/use-waiting-room'

function GameWaitingRoom({ roomId }: { roomId: string }) {
  useGameRoomSocket(roomId)
  const {
    room,
    activeParticipants,
    isHost,
    canStart,
    isLoading,
    currentUserId,
    handleLeave,
    handleStart,
    isLeaving,
    isStarting
  } = useWaitingRoom(roomId)

  if (isLoading) {
    return <div className="text-center py-20 text-wefin-subtle">로딩 중...</div>
  }

  if (!room) {
    return <div className="text-center py-20 text-wefin-subtle">방을 찾을 수 없습니다</div>
  }

  const statusLabel = room.status === 'WAITING' ? '대기 중' : '진행중'

  return (
    <div className="space-y-6">
      <Header
        statusLabel={statusLabel}
        seed={room.seed}
        periodMonths={room.periodMonths}
        onLeave={handleLeave}
        isLeaving={isLeaving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ParticipantList participants={activeParticipants} currentUserId={currentUserId} />
        </div>
        <div className="lg:col-span-2">
          <ChatPlaceholder />
        </div>
      </div>

      {isHost && (
        <button
          onClick={handleStart}
          disabled={!canStart || isStarting}
          className="w-full flex items-center justify-center gap-2 bg-wefin-mint text-white py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Play className="w-5 h-5" />
          {isStarting ? '시작 중...' : '게임 시작하기'}
        </button>
      )}
    </div>
  )
}

function Header({
  statusLabel,
  seed,
  periodMonths,
  onLeave,
  isLeaving
}: {
  statusLabel: string
  seed: number
  periodMonths: number
  onLeave: () => void
  isLeaving: boolean
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onLeave}
          disabled={isLeaving}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-wefin-line hover:bg-wefin-bg transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 text-wefin-text" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-wefin-text">대기실</h1>
          <p className="text-sm text-wefin-subtle">멤버들이 모두 모이면 게임을 시작하세요</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border border-wefin-line rounded-xl px-4 py-2">
          <InfoChip label="시드" value={`${seed / 10000}만`} />
          <div className="w-px h-8 bg-wefin-line" />
          <InfoChip label="기간" value={`${periodMonths}m`} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-wefin-mint animate-pulse" />
          <span className="text-sm font-medium text-wefin-mint">{statusLabel}</span>
        </div>
      </div>
    </div>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-wefin-subtle">{label}</p>
      <p className="text-sm font-semibold text-wefin-mint">{value}</p>
    </div>
  )
}

function ParticipantList({
  participants,
  currentUserId
}: {
  participants: ParticipantDetail[]
  currentUserId: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-wefin-line p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-wefin-text">참여자 ({participants.length}/6)</h2>
      </div>
      <div className="space-y-3">
        {participants.map((p, index) => (
          <ParticipantItem
            key={p.participantId}
            participant={p}
            index={index + 1}
            isMe={p.userId === currentUserId}
          />
        ))}
      </div>
    </div>
  )
}

function ParticipantItem({
  participant,
  index,
  isMe
}: {
  participant: ParticipantDetail
  index: number
  isMe: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-3 ${isMe ? 'bg-wefin-mint-soft' : 'bg-wefin-bg'}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm text-wefin-subtle w-6">{index}</span>
        <span className="font-medium text-wefin-text">
          {participant.userName}
          {isMe && <span className="text-wefin-mint ml-1">(나)</span>}
        </span>
        {participant.isLeader && (
          <span className="text-xs bg-wefin-mint text-white px-2 py-0.5 rounded font-medium">
            HOST
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-sm text-green-600 font-medium">준비 완료</span>
      </div>
    </div>
  )
}

function ChatPlaceholder() {
  return (
    <div className="bg-white rounded-2xl border border-wefin-line p-6 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-wefin-subtle" />
        <h2 className="text-lg font-bold text-wefin-text">그룹 채팅</h2>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-wefin-subtle text-sm">채팅 기능 준비 중...</p>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          disabled
          className="flex-1 border border-wefin-line rounded-full px-4 py-2 text-sm bg-wefin-bg text-wefin-subtle"
        />
        <button
          disabled
          className="w-10 h-10 flex items-center justify-center rounded-full bg-wefin-mint text-white opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default GameWaitingRoom
