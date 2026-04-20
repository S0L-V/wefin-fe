import { LogOut, Play } from 'lucide-react'

import ChatPanel from '@/features/chat/ui/chat-panel'
import { getProfileGradient } from '@/features/settings/lib/profile-gradient'

import { useGameRoomSocket } from '../model/use-game-room-socket'
import { useWaitingRoom } from '../model/use-waiting-room'

function GameWaitingRoom({
  roomId,
  onLeaveRequest
}: {
  roomId: string
  onLeaveRequest: () => void
}) {
  useGameRoomSocket(roomId)
  const {
    room,
    activeParticipants,
    isHost,
    canStart,
    isLoading,
    currentUserId,
    handleStart,
    isStarting
  } = useWaitingRoom(roomId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] py-8">
        <div className="h-6 w-36 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-gray-100" />
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
          <div className="h-[calc(100dvh-220px)] min-h-[400px] max-h-[700px] animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    )
  }

  if (!room) {
    return <div className="py-20 text-center text-sm text-wefin-subtle">방을 찾을 수 없습니다</div>
  }

  const isWaiting = room.status === 'WAITING'
  const seedLabel = `${room.seed / 10000}만원`
  const periodLabel = `${room.periodMonths}개월`

  return (
    <div className="mx-auto max-w-[1100px] py-8">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-wefin-text">대기실</h1>
          <p className="mt-0.5 text-sm text-wefin-subtle">멤버들이 모이면 게임을 시작하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-lg border border-wefin-line px-4 py-2 text-sm">
            <span className="text-wefin-subtle">시드</span>
            <span className="font-bold text-wefin-mint-deep">{seedLabel}</span>
            <span className="text-wefin-line">|</span>
            <span className="text-wefin-subtle">기간</span>
            <span className="font-bold text-wefin-mint-deep">{periodLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${isWaiting ? 'animate-pulse bg-amber-400' : 'bg-wefin-mint'}`}
            />
            <span
              className={`text-xs font-semibold ${isWaiting ? 'text-amber-500' : 'text-wefin-mint-deep'}`}
            >
              {isWaiting ? '대기 중' : '진행 중'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-wefin-text">
                  참여자 {activeParticipants.length}/6
                </h2>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              </div>
            </div>
            <div className="mt-2.5 flex gap-2">
              {activeParticipants.map((p, idx) => {
                const isMe = p.userId === currentUserId
                const initial = (p.userName || '?').charAt(0).toUpperCase()

                const myGrad = getProfileGradient()
                const allColors = [
                  ['#0f8385', '#34d399'],
                  ['#2563eb', '#60a5fa'],
                  ['#7c3aed', '#a78bfa'],
                  ['#e11d48', '#fb7185'],
                  ['#d97706', '#fbbf24'],
                  ['#334155', '#64748b']
                ]
                const othersColors = allColors.filter(([f]) => f !== myGrad.from)

                let from: string, to: string
                if (isMe) {
                  from = myGrad.from
                  to = myGrad.to
                } else {
                  const otherIdx = idx % othersColors.length
                  ;[from, to] = othersColors[otherIdx]
                }

                return (
                  <div key={p.participantId} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                          isMe ? 'ring-2 ring-wefin-mint ring-offset-1' : ''
                        }`}
                        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                      >
                        {initial}
                      </span>
                      {p.isLeader && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5L16 13.5 22 9h-7z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] ${isMe ? 'font-semibold text-wefin-mint-deep' : 'text-wefin-subtle'}`}
                    >
                      {p.userName}
                    </span>
                  </div>
                )
              })}
              {Array.from({ length: 6 - activeParticipants.length }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-wefin-line/50 text-sm text-wefin-subtle/30">
                    ?
                  </span>
                  <span className="text-[10px] text-transparent">-</span>
                </div>
              ))}
            </div>
          </div>

          <GameTips />

          <div className="flex items-center gap-2">
            <button
              onClick={onLeaveRequest}
              className="flex items-center gap-1.5 rounded-xl border border-wefin-line/60 bg-white px-4 py-2.5 text-sm font-medium text-wefin-subtle shadow-sm transition-all hover:border-rose-200 hover:text-rose-400 hover:shadow-none"
            >
              <LogOut size={14} />
              나가기
            </button>
            {isHost && (
              <button
                onClick={handleStart}
                disabled={!canStart || isStarting}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-wefin-mint py-2.5 text-sm font-semibold text-white transition-all hover:bg-wefin-mint-deep active:scale-[0.97] disabled:opacity-50"
              >
                <Play size={14} />
                {isStarting ? '시작 중...' : '게임 시작'}
              </button>
            )}
          </div>
        </div>

        <div className="card-base flex h-[calc(100dvh-220px)] min-h-[400px] max-h-[700px] flex-col overflow-hidden lg:sticky lg:top-20">
          <ChatPanel />
        </div>
      </div>
    </div>
  )
}

function GameTips() {
  const tips = [
    '방장이 "게임 시작"을 누르면 과거 시장으로 이동합니다',
    '매 턴마다 AI가 시장 브리핑을 제공해요',
    '종목을 분석하고 매수/매도를 결정하세요',
    '최종 수익률로 순위가 결정됩니다'
  ]

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-wefin-text">게임 진행 안내</h3>
      <div className="mt-3 space-y-2">
        {tips.map((text, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wefin-mint-soft text-[10px] font-bold text-wefin-mint-deep">
              {i + 1}
            </span>
            <p className="text-xs text-wefin-subtle">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameWaitingRoom
