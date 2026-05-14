import { motion } from 'framer-motion'
import { LogOut, Play } from 'lucide-react'

const participants = [
  { name: '김투자', initial: '김', isHost: true, colors: ['#0f8385', '#34d399'] },
  { name: '이재테크', initial: '이', isHost: false, colors: ['#2563eb', '#60a5fa'] },
  { name: '박워렌', initial: '박', isHost: false, colors: ['#7c3aed', '#a78bfa'] }
]

export default function StepWaitingRoom() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-wefin-text sm:text-xl">대기실</h1>
          <p className="mt-0.5 text-xs text-wefin-subtle sm:text-sm">
            멤버들이 모이면 게임을 시작하세요
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-wefin-line px-3 py-1.5 text-xs sm:gap-2.5 sm:px-4 sm:py-2 sm:text-sm">
            <span className="text-wefin-subtle">시드</span>
            <span className="font-bold text-wefin-mint-deep">5000만원</span>
            <span className="text-wefin-line">|</span>
            <span className="text-wefin-subtle">기간</span>
            <span className="font-bold text-wefin-mint-deep">6개월</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-500">대기 중</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          {/* Participants */}
          <div className="rounded-2xl bg-wefin-surface p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-wefin-text">참여자 3/6</h2>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            </div>
            <div className="mt-2.5 flex gap-2">
              {participants.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="relative">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                        i === 0 ? 'ring-2 ring-wefin-mint ring-offset-1' : ''
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})`
                      }}
                    >
                      {p.initial}
                    </span>
                    {p.isHost && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5L16 13.5 22 9h-7z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] ${i === 0 ? 'font-semibold text-wefin-mint-deep' : 'text-wefin-subtle'}`}
                  >
                    {p.name}
                  </span>
                </motion.div>
              ))}
              {/* Empty slots */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`empty-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-wefin-line/50 text-sm text-wefin-subtle/30">
                    ?
                  </span>
                  <span className="text-[10px] text-transparent">-</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-wefin-surface p-5 shadow-sm"
          >
            <h3 className="text-sm font-bold text-wefin-text">게임 진행 안내</h3>
            <div className="mt-3 space-y-2">
              {[
                '방장이 "게임 시작"을 누르면 과거 시장으로 이동합니다',
                '매 턴마다 AI가 시장 브리핑을 제공해요',
                '종목을 분석하고 매수/매도를 결정하세요',
                '최종 수익률로 순위가 결정됩니다'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wefin-mint-soft text-[10px] font-bold text-wefin-mint-deep">
                    {i + 1}
                  </span>
                  <p className="text-xs text-wefin-subtle">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2"
          >
            <button className="flex items-center gap-1.5 rounded-xl border border-wefin-line/60 bg-wefin-surface px-4 py-2.5 text-sm font-medium text-wefin-subtle shadow-sm">
              <LogOut size={14} /> 나가기
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-wefin-mint py-2.5 text-sm font-semibold text-white">
              <Play size={14} /> 게임 시작
            </button>
          </motion.div>
        </div>

        {/* Chat placeholder */}
        <div className="card-base hidden h-80 items-center justify-center lg:flex">
          <p className="text-xs text-wefin-muted">그룹 채팅</p>
        </div>
      </div>
    </div>
  )
}
