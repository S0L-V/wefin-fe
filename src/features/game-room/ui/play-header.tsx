import { ChevronRight, LogOut, Square } from 'lucide-react'

interface PlayHeaderProps {
  currentRound: number
  currentDate: string
  seed: number
  totalAssets: number
  profitRate: number
  activePlayers: number
  isHost: boolean
  isAdvancing: boolean
  isEnding: boolean
  onNextTurn: () => void
  onLeave: () => void
  onEndGame: () => void
}

function PlayHeader({
  currentRound,
  currentDate,
  totalAssets,
  profitRate,
  activePlayers,
  isHost,
  isAdvancing,
  isEnding,
  onNextTurn,
  onLeave,
  onEndGame
}: PlayHeaderProps) {
  const profitColor =
    profitRate > 0 ? 'text-red-400' : profitRate < 0 ? 'text-blue-400' : 'text-white/50'
  const profitSign = profitRate > 0 ? '+' : ''
  const progress = totalTurns > 0 ? (currentRound / totalTurns) * 100 : 0

  return (
    <div className="shrink-0 bg-gradient-to-r from-[#1a1f36] to-[#0f2027] px-5 py-2.5 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              진행 상황
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tabular-nums">{currentRound}</span>
              <span className="text-xs text-white/40">/ {totalTurns}턴</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              현재 날짜
            </p>
            <p className="text-sm font-semibold tabular-nums">{currentDate}</p>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              총 자산
            </p>
            <p className="text-sm font-bold tabular-nums">
              {totalAssets.toLocaleString()}
              <span className="ml-0.5 text-xs font-normal text-white/40">원</span>
            </p>
          </div>

          <div className={`text-sm font-bold tabular-nums ${profitColor}`}>
            {profitSign}
            {profitRate.toFixed(2)}%
          </div>

          <div className="flex items-center gap-1 text-xs text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {activePlayers}명
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHost && (
            <button
              type="button"
              onClick={onNextTurn}
              disabled={isAdvancing}
              className="flex items-center gap-1.5 rounded-lg bg-wefin-mint px-4 py-2 text-xs font-bold text-white transition-all hover:bg-wefin-mint-deep hover:shadow-[0_0_16px_rgba(36,168,171,0.4)] disabled:opacity-50"
            >
              {isAdvancing ? '전환 중…' : '다음 턴'}
              <ChevronRight size={14} />
            </button>
          )}
          {isHost && (
            <button
              type="button"
              onClick={onEndGame}
              disabled={isEnding}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50"
            >
              <Square size={10} className="mr-1 inline fill-current" />
              {isEnding ? '종료 중…' : '종료'}
            </button>
          )}
          <button
            type="button"
            onClick={onLeave}
            className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
          >
            <LogOut size={12} />
            나가기
          </button>
        </div>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-wefin-mint to-wefin-mint-deep transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default PlayHeader
