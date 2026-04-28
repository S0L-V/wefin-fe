import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export default function StepCreateRoom() {
  return (
    <div className="p-6">
      <div className="card-base mx-auto max-w-lg">
        <div className="p-6">
          <h2 className="text-lg font-extrabold text-wefin-text">새 게임</h2>

          <div className="mt-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm font-bold text-wefin-text">얼마로 시작할까요?</p>
              <p className="mt-1 text-[12px] text-wefin-subtle">가상 자본금으로 매매합니다</p>
              <div className="mt-3 flex gap-2">
                {['1,000만원', '3,000만원', '5,000만원', '1억원'].map((label, i) => (
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <p className="text-sm font-bold text-wefin-text">어느 기간의 시장을 경험할까요?</p>
              <p className="mt-1 text-[12px] text-wefin-subtle">과거 시장이 랜덤으로 선택됩니다</p>
              <div className="mt-3 flex gap-2">
                {['3개월', '6개월', '1년'].map((label, i) => (
                  <button
                    key={label}
                    className={`flex-1 whitespace-nowrap rounded-xl py-3 text-xs font-semibold transition-all sm:text-sm ${
                      i === 1
                        ? 'bg-wefin-mint text-white shadow-sm'
                        : 'bg-wefin-surface-2 text-wefin-text'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm font-bold text-wefin-text">한 턴에 며칠씩 이동할까요?</p>
              <p className="mt-1 text-[12px] text-wefin-subtle">턴마다 매매 기회가 주어집니다</p>
              <div className="mt-3 flex gap-2">
                {['1일', '3일', '7일', '14일', '30일'].map((label, i) => (
                  <button
                    key={label}
                    className={`flex-1 whitespace-nowrap rounded-xl py-3 text-xs font-semibold transition-all sm:text-sm ${
                      i === 2
                        ? 'bg-wefin-mint text-white shadow-sm'
                        : 'bg-wefin-surface-2 text-wefin-text'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-between border-t border-wefin-line px-6 py-4"
        >
          <p className="min-w-0 text-xs text-wefin-subtle sm:text-sm">
            5,000만원 · 6개월 · 7일마다 ·{' '}
            <span className="font-bold text-wefin-mint-deep">27턴</span>
          </p>
          <button className="group relative shrink-0 overflow-hidden rounded-lg bg-gradient-to-r from-wefin-mint-deep to-wefin-mint px-6 py-2.5 text-sm font-bold text-white">
            <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
              <Play size={14} /> 시작
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
