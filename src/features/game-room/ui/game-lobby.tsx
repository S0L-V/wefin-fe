import { BookOpen, ChevronRight, Clock, Play, Trophy, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import ChatPanel from '@/features/chat/ui/chat-panel'
import RankBadge from '@/shared/ui/rank-badge'

import type { GameHistoryItem, RoomListItem } from '../model/game-room.schema'
import { useCreateRoomForm } from '../model/use-create-room-form'
import { useGameLobby } from '../model/use-game-lobby'
import { useJoinGameRoomMutation } from '../model/use-game-room-query'

function formatSeedLabel(value: number) {
  return `${(value / 10_000).toLocaleString()}만원`
}

function formatPeriodLabel(months: number) {
  if (months === 12) return '1년'
  return `${months}개월`
}

function GameLobby() {
  const { activeRoom, recentHistory, isLoading } = useGameLobby()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] py-8">
        <div className="h-6 w-36 animate-pulse rounded-lg bg-wefin-surface-2" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-wefin-surface-2" />
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <div className="space-y-5">
            <div className="card-base h-[280px] animate-pulse" />
            <div className="card-base h-[200px] animate-pulse" />
          </div>
          <div className="card-base h-[calc(100dvh-220px)] min-h-[280px] animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-0 sm:py-8">
      <h1 className="text-xl font-extrabold text-wefin-text sm:text-2xl">타임머신 투자</h1>
      <div className="mt-1 flex items-center gap-3 sm:mt-1.5">
        <p className="text-[13px] text-wefin-subtle sm:text-[15px]">
          과거 시장 데이터로 투자를 학습하고, 함께 전략을 나눠보세요
        </p>
        <Link
          to="/history/tutorial"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-wefin-mint-deep to-wefin-mint px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-[0_4px_12px_rgba(20,184,166,0.3)] active:scale-[0.97]"
        >
          <BookOpen size={13} />
          게임 방법
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 items-start gap-5 sm:mt-6 xl:grid-cols-2">
        <div className="flex flex-col gap-4 sm:gap-5">
          {activeRoom ? <ActiveRoomCard room={activeRoom} /> : <CreateRoomInline />}
          <GameHistorySection items={recentHistory} />
        </div>

        <div className="card-base hidden h-[calc(100dvh-220px)] min-h-[280px] flex-col overflow-hidden xl:sticky xl:top-20 xl:flex">
          <ChatPanel />
        </div>
      </div>
    </div>
  )
}

function CreateRoomInline() {
  const {
    seedMoney,
    setSeedMoney,
    periodMonths,
    setPeriodMonths,
    moveDays,
    setMoveDays,
    handleSubmit,
    errorMessage,
    isSubmitting,
    seedOptions,
    periodOptions,
    moveDaysOptions,
    disabledPeriods
  } = useCreateRoomForm()

  const totalTurns = Math.ceil((periodMonths * 30) / moveDays) + 1

  return (
    <div className="card-base">
      <div className="p-6">
        <h2 className="text-lg font-extrabold text-wefin-text">새 게임</h2>

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-sm font-bold text-wefin-text">얼마로 시작할까요?</p>
            <p className="mt-1 text-[12px] text-wefin-subtle">가상 자본금으로 매매합니다</p>
            <div className="mt-3 flex gap-2">
              {seedOptions.map((value) => (
                <OptionButton
                  key={value}
                  selected={seedMoney === value}
                  onClick={() => setSeedMoney(value)}
                >
                  {formatSeedLabel(value)}
                </OptionButton>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-wefin-text">어느 기간의 시장을 경험할까요?</p>
            <p className="mt-1 text-[12px] text-wefin-subtle">과거 시장이 랜덤으로 선택됩니다</p>
            <div className="mt-3 flex gap-2">
              {periodOptions.map((value) => (
                <OptionButton
                  key={value}
                  selected={periodMonths === value}
                  disabled={disabledPeriods.includes(value)}
                  onClick={() => setPeriodMonths(value)}
                >
                  {formatPeriodLabel(value)}
                </OptionButton>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-wefin-text">한 턴에 며칠씩 이동할까요?</p>
            <p className="mt-1 text-[12px] text-wefin-subtle">턴마다 매매 기회가 주어집니다</p>
            <div className="mt-3 flex gap-2">
              {moveDaysOptions.map((value) => (
                <OptionButton
                  key={value}
                  selected={moveDays === value}
                  onClick={() => setMoveDays(value)}
                >
                  {value}일
                </OptionButton>
              ))}
            </div>
          </div>
        </div>

        {errorMessage && <p className="mt-4 text-center text-sm text-wefin-red">{errorMessage}</p>}
      </div>

      <div className="flex items-center justify-between border-t border-wefin-line px-6 py-4">
        <p className="text-sm text-wefin-subtle">
          {formatSeedLabel(seedMoney)} · {formatPeriodLabel(periodMonths)} · {moveDays}일마다 ·{' '}
          <span className="font-bold text-wefin-mint-deep">{totalTurns}턴</span>
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="group relative shrink-0 overflow-hidden rounded-lg bg-gradient-to-r from-wefin-mint-deep to-wefin-mint px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_4px_16px_rgba(20,184,166,0.35)] active:scale-[0.97] disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Play size={14} />
            {isSubmitting ? '생성 중...' : '시작'}
          </span>
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
        </button>
      </div>
    </div>
  )
}

function ActiveRoomCard({ room }: { room: RoomListItem }) {
  const navigate = useNavigate()
  const joinMutation = useJoinGameRoomMutation()
  const isWaiting = room.status === 'WAITING'

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
          toast.error('이미 종료한 게임입니다.')
        }
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleEnter}
      disabled={joinMutation.isPending}
      className="card-base group flex w-full items-center gap-4 p-6 text-left transition-all hover:shadow-[0_8px_24px_-12px_rgba(14,21,18,0.15)] disabled:opacity-60"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          isWaiting ? 'bg-wefin-amber-soft' : 'bg-gradient-to-br from-wefin-mint to-wefin-mint-deep'
        }`}
      >
        <Play size={18} className={isWaiting ? 'text-amber-500' : 'text-white'} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-wefin-text">
          {isWaiting ? '멤버를 기다리는 중' : '게임 진행 중'}
        </p>
        <div className="mt-1 flex items-center gap-2.5 text-sm text-wefin-subtle">
          <span className="flex items-center gap-1">
            <Users size={13} />
            {room.currentPlayers}명
          </span>
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-bold ${
              isWaiting
                ? 'bg-wefin-amber-soft text-amber-600'
                : 'bg-wefin-mint-soft text-wefin-mint-deep'
            }`}
          >
            {isWaiting ? '대기 중' : '게임 중'}
          </span>
        </div>
      </div>
      <span className="shrink-0 rounded-lg bg-wefin-mint px-5 py-2.5 text-sm font-bold text-white transition-all group-hover:bg-wefin-mint-deep">
        {joinMutation.isPending ? '입장 중...' : '입장하기'}
      </span>
    </button>
  )
}

function GameHistorySection({ items }: { items: GameHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="card-base flex flex-col items-center justify-center py-12 text-center">
        <Trophy size={32} className="text-wefin-line-2" />
        <p className="mt-4 text-sm font-semibold text-wefin-text">아직 게임 기록이 없어요</p>
        <p className="mt-1 text-xs text-wefin-subtle">
          게임을 시작해서 나만의 투자 기록을 만들어보세요
        </p>
      </div>
    )
  }

  return (
    <div className="card-base">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-wefin-subtle" />
          <h2 className="text-[15px] font-bold text-wefin-text">지난 게임</h2>
        </div>
        <Link
          to="/history/archive"
          className="flex items-center gap-0.5 text-sm font-medium text-wefin-subtle transition-colors hover:text-wefin-mint-deep"
        >
          전체보기
          <ChevronRight size={14} />
        </Link>
      </div>
      <div className="px-4 pb-4">
        {items.map((item) => (
          <GameHistoryCard key={item.roomId} item={item} />
        ))}
      </div>
    </div>
  )
}

function GameHistoryCard({ item }: { item: GameHistoryItem }) {
  const seedLabel = `${(item.seedMoney / 10000).toLocaleString()}만원`
  const periodLabel = `${item.periodMonths}개월`
  const isPositive = item.profitRate >= 0
  const profitColor = isPositive ? 'text-wefin-red' : 'text-wefin-blue'
  const profitSign = isPositive ? '+' : ''
  const rankLabel = item.finalRank != null ? `${item.finalRank}등` : '-'

  return (
    <Link
      to={`/history/room/${item.roomId}/result`}
      className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors hover:bg-wefin-surface-2"
    >
      <div className="flex items-center gap-3.5">
        <RankBadge rank={item.finalRank} />
        <div>
          <p className="text-[15px] font-semibold text-wefin-text">
            {seedLabel} · {periodLabel} · {item.participantCount}명
          </p>
          <p className="mt-0.5 text-[12.5px] text-wefin-subtle">
            {item.startDate.replaceAll('-', '.')} ~ {item.endDate.replaceAll('-', '.')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-num text-[15px] font-bold ${profitColor}`}>
          {profitSign}
          {item.profitRate.toFixed(2)}%
        </p>
        <p className="mt-0.5 text-[12.5px] text-wefin-subtle">
          {rankLabel} / {item.participantCount}명
        </p>
      </div>
    </Link>
  )
}

function OptionButton({
  selected,
  disabled,
  onClick,
  children
}: {
  selected: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="flex-1 rounded-xl bg-wefin-surface-2 py-3 text-sm text-wefin-muted"
      >
        {children}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
        selected
          ? 'bg-wefin-mint text-white shadow-sm'
          : 'bg-wefin-surface-2 text-wefin-text hover:bg-wefin-mint-soft hover:text-wefin-mint-deep'
      }`}
    >
      {children}
    </button>
  )
}

export default GameLobby
