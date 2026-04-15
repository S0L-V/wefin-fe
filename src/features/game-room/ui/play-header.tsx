import { Play } from 'lucide-react'

interface PlayHeaderProps {
  currentRound: number
  currentDate: string
  seed: number
  totalAssets: number
  profitRate: number
  isHost: boolean
  isAdvancing: boolean
  onNextTurn: () => void
  onLeave: () => void
  onEndGame: () => void
}

function PlayHeader({
  currentRound,
  currentDate,
  seed,
  totalAssets,
  profitRate,
  isHost,
  isAdvancing,
  onNextTurn,
  onLeave,
  onEndGame
}: PlayHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-wefin-line bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wefin-mint">
            <span className="text-sm font-bold text-white">T</span>
          </div>
          <span className="font-bold text-wefin-text">타임머신 모의투자</span>
          <span className="rounded-full bg-wefin-mint-soft px-2 py-0.5 text-xs font-bold text-wefin-mint">
            {currentRound}턴
          </span>
        </div>

        <div className="h-4 w-px bg-wefin-line" />

        <dl className="flex items-center gap-6 text-sm">
          <MetaField label="현재" value={currentDate} />
          <MetaField label="시드" value={`${seed.toLocaleString()}원`} />
          <MetaField label="총자산" value={`${totalAssets.toLocaleString()}원`} />
          <ProfitField profitRate={profitRate} />
        </dl>
      </div>

      <div className="flex items-center gap-3">
        {isHost && (
          <button
            type="button"
            onClick={onNextTurn}
            disabled={isAdvancing}
            className="flex items-center gap-2 rounded-xl bg-wefin-mint px-5 py-2 text-sm font-bold text-white shadow-lg shadow-wefin-mint/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={14} fill="currentColor" />
            {isAdvancing ? '전환 중…' : '다음으로 이동'}
          </button>
        )}
        <button
          type="button"
          onClick={onLeave}
          className="rounded-xl bg-wefin-bg px-4 py-2 text-sm font-bold text-wefin-subtle transition-colors hover:bg-wefin-line"
        >
          방 나가기
        </button>
        <button
          type="button"
          onClick={onEndGame}
          className="rounded-xl bg-wefin-text px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          게임 종료
        </button>
      </div>
    </header>
  )
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] font-bold uppercase text-wefin-subtle">{label}</dt>
      <dd className="font-bold text-wefin-text">{value}</dd>
    </div>
  )
}

function ProfitField({ profitRate }: { profitRate: number }) {
  // 보합(0%)은 중립 — 빨강/파랑 모두 부적절. 부호(+)도 붙이지 않음.
  // 음수는 toFixed가 '-'를 직접 붙여주므로 sign에는 양수일 때만 '+'를 지정.
  const colorClass =
    profitRate > 0 ? 'text-red-500' : profitRate < 0 ? 'text-blue-500' : 'text-wefin-subtle'
  const sign = profitRate > 0 ? '+' : ''
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] font-bold uppercase text-wefin-subtle">수익률</dt>
      <dd className={`font-bold ${colorClass}`}>
        {sign}
        {profitRate.toFixed(2)}%
      </dd>
    </div>
  )
}

export default PlayHeader
