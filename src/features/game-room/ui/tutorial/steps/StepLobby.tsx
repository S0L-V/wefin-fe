import { motion } from 'framer-motion'
import { ChevronRight, Clock, Play, Trophy, Users } from 'lucide-react'

export default function StepLobby() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-extrabold text-wefin-text sm:text-2xl">타임머신 투자</h1>
      <p className="mt-1 text-[13px] text-wefin-subtle">
        과거 시장 데이터로 투자를 학습하고, 함께 전략을 나눠보세요
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {/* Create Room Inline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-base"
          >
            <div className="p-6">
              <h2 className="text-lg font-extrabold text-wefin-text">새 게임</h2>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-sm font-bold text-wefin-text">얼마로 시작할까요?</p>
                  <p className="mt-1 text-[12px] text-wefin-subtle">가상 자본금으로 매매합니다</p>
                  <div className="mt-3 flex gap-2">
                    {['1,000만원', '3,000만원', '5,000만원', '1억원'].map((label, i) => (
                      <motion.button
                        key={label}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className={`flex-1 whitespace-nowrap rounded-xl py-3 text-xs font-semibold transition-all sm:text-sm ${
                          i === 2
                            ? 'bg-wefin-mint text-white shadow-sm'
                            : 'bg-wefin-surface-2 text-wefin-text'
                        }`}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-wefin-text">
                    어느 기간의 시장을 경험할까요?
                  </p>
                  <p className="mt-1 text-[12px] text-wefin-subtle">
                    과거 시장이 랜덤으로 선택됩니다
                  </p>
                  <div className="mt-3 flex gap-2">
                    {['3개월', '6개월', '1년'].map((label, i) => (
                      <button
                        key={label}
                        className={`flex-1 whitespace-nowrap rounded-xl py-3 text-xs font-semibold transition-all sm:text-sm ${
                          i === 1
                            ? 'bg-wefin-mint text-white shadow-sm'
                            : 'bg-wefin-surface-2 text-wefin-text hover:bg-wefin-mint-soft hover:text-wefin-mint-deep'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-wefin-text">한 턴에 며칠씩 이동할까요?</p>
                  <p className="mt-1 text-[12px] text-wefin-subtle">
                    턴마다 매매 기회가 주어집니다
                  </p>
                  <div className="mt-3 flex gap-2">
                    {['1일', '3일', '7일', '14일', '30일'].map((label, i) => (
                      <button
                        key={label}
                        className={`flex-1 whitespace-nowrap rounded-xl py-3 text-xs font-semibold transition-all sm:text-sm ${
                          i === 2
                            ? 'bg-wefin-mint text-white shadow-sm'
                            : 'bg-wefin-surface-2 text-wefin-text hover:bg-wefin-mint-soft hover:text-wefin-mint-deep'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-wefin-line px-6 py-4">
              <p className="min-w-0 text-xs text-wefin-subtle sm:text-sm">
                5,000만원 · 6개월 · 7일마다 ·{' '}
                <span className="font-bold text-wefin-mint-deep">27턴</span>
              </p>
              <motion.button
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="group relative shrink-0 overflow-hidden rounded-lg bg-gradient-to-r from-wefin-mint-deep to-wefin-mint px-6 py-2.5 text-sm font-bold text-white"
              >
                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                  <Play size={14} /> 시작
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-base"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-wefin-subtle" />
                <h2 className="text-[15px] font-bold text-wefin-text">지난 게임</h2>
              </div>
              <span className="flex items-center gap-0.5 text-sm font-medium text-wefin-subtle">
                전체보기 <ChevronRight size={14} />
              </span>
            </div>
            <div className="px-4 pb-4">
              {[
                { seed: '5,000만원', period: '6개월', players: 4, profit: 12.45, rank: 1 },
                { seed: '1,000만원', period: '3개월', players: 3, profit: -3.21, rank: 2 }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-wefin-surface-2">
                      <Trophy size={16} className="text-wefin-subtle" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-wefin-text">
                        {item.seed} · {item.period} · {item.players}명
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-wefin-subtle">
                        2023.01.02 ~ 2023.06.30
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-num text-[15px] font-bold ${item.profit >= 0 ? 'text-wefin-red' : 'text-wefin-blue'}`}
                    >
                      {item.profit >= 0 ? '+' : ''}
                      {item.profit.toFixed(2)}%
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-wefin-subtle">
                      {item.rank}등 / {item.players}명
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Chat placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-base hidden h-80 items-center justify-center lg:flex"
        >
          <div className="text-center">
            <Users size={32} className="mx-auto text-wefin-line-2" />
            <p className="mt-3 text-sm font-semibold text-wefin-text">그룹 채팅</p>
            <p className="mt-1 text-xs text-wefin-muted">팀원들과 실시간 대화</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
