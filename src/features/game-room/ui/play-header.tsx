import { ChevronRight, LogOut, Square } from 'lucide-react'

interface PlayHeaderProps {
  currentRound: number
  totalTurns: number
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
  totalTurns,
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
    <div className="shrink-0 bg-gradient-to-r from-[#1a1f36] to-[#0f2027] px-3 py-2.5 text-white sm:px-7 sm:py-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-7">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold tabular-nums sm:text-2xl">{currentRound}</span>
            <span className="text-xs font-bold text-white/60 sm:text-base">/ {totalTurns}턴</span>
          </div>

          <div className="hidden h-10 w-px bg-white/20 sm:block" />

          <div className="hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">현재 날짜</p>
            <p className="mt-0.5 text-lg font-extrabold tabular-nums">
              {currentDate.replaceAll('-', '.')}
            </p>
          </div>

          <div className="hidden h-10 w-px bg-white/20 sm:block" />

          <div>
            <p className="hidden text-xs font-bold uppercase tracking-wide text-white/70 sm:block">
              총 자산
            </p>
            <p className="text-sm font-extrabold tabular-nums sm:mt-0.5 sm:text-lg">
              {Math.floor(totalAssets).toLocaleString()}
              <span className="ml-0.5 text-xs font-bold text-white/60 sm:ml-1 sm:text-sm">원</span>
            </p>
          </div>

          <div className={`text-sm font-extrabold tabular-nums sm:text-lg ${profitColor}`}>
            {profitSign}
            {profitRate.toFixed(2)}%
          </div>

          <div className="hidden items-center gap-1.5 text-base font-bold text-white/70 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            {activePlayers}명
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isHost && (
            <button
              type="button"
              onClick={onNextTurn}
              disabled={isAdvancing}
              className="flex items-center gap-1 rounded-lg bg-wefin-mint px-3 py-2 text-xs font-bold text-white transition-all hover:bg-wefin-mint-deep disabled:opacity-50 sm:gap-1.5 sm:px-5 sm:py-2.5 sm:text-sm"
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
              className="hidden rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50 sm:block"
            >
              <Square size={10} className="mr-1 inline fill-current" />
              {isEnding ? '종료 중…' : '종료'}
            </button>
          )}
          <button
            type="button"
            onClick={onLeave}
            className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-2 text-xs font-bold text-white/70 transition-colors hover:bg-rose-500/20 hover:text-rose-300 sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">나가기</span>
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
