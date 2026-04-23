import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function StepVote() {
  const [remaining, setRemaining] = useState(15)
  const [voted, setVoted] = useState(false)
  const [result, setResult] = useState<'passed' | 'rejected' | null>(null)

  useEffect(() => {
    if (result) return
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [result])

  useEffect(() => {
    const t1 = setTimeout(() => setVoted(true), 3000)
    const t2 = setTimeout(() => setResult('passed'), 6000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-full max-w-sm mx-auto">
        {/* Dialog-style modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-wefin-line bg-wefin-surface p-8 shadow-xl"
        >
          <div className="flex flex-col items-center gap-5 py-3">
            <h2 className="text-xl font-extrabold text-wefin-text">
              {result ? '투표 결과' : '턴 전환 투표'}
            </h2>
            <p className="text-sm font-medium text-wefin-subtle">
              {result
                ? result === 'passed'
                  ? '다음 턴으로 이동합니다'
                  : '투표가 부결되었습니다'
                : '김투자님이 다음 턴 전환을 요청했습니다'}
            </p>

            {result ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  result === 'passed' ? 'bg-green-50' : 'bg-wefin-red-soft'
                }`}
              >
                {result === 'passed' ? (
                  <Check className="h-8 w-8 text-green-500" />
                ) : (
                  <X className="h-8 w-8 text-wefin-red" />
                )}
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={remaining}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-num text-4xl font-extrabold text-wefin-mint"
                >
                  {remaining}초
                </motion.div>

                {/* 3-column grid vote count */}
                <div className="grid w-full grid-cols-3 overflow-hidden rounded-xl border border-wefin-line">
                  <div className="flex flex-col items-center gap-1 py-4">
                    <span className="text-xs font-bold text-wefin-mint">찬성</span>
                    <span className="font-num text-2xl font-extrabold text-wefin-mint">
                      {voted ? 2 : 1}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-x border-wefin-line py-4">
                    <span className="text-xs font-bold text-wefin-red">반대</span>
                    <span className="font-num text-2xl font-extrabold text-wefin-red">0</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 py-4">
                    <span className="text-xs font-bold text-wefin-subtle">전체</span>
                    <span className="font-num text-2xl font-extrabold text-wefin-text">3</span>
                  </div>
                </div>

                {!voted ? (
                  <div className="flex w-full gap-3 pt-1">
                    <button className="flex-1 rounded-xl border-2 border-wefin-red/30 py-3.5 text-base font-bold text-wefin-red">
                      반대
                    </button>
                    <motion.button
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex-1 rounded-xl bg-wefin-mint py-3.5 text-base font-bold text-white"
                    >
                      찬성
                    </motion.button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-wefin-subtle">
                    투표 완료 — 결과를 기다리는 중...
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-2xl border-2 border-wefin-mint bg-wefin-mint-soft p-5"
        >
          <p className="text-sm font-bold text-wefin-mint-deep mb-3">💡 투표 시스템</p>
          <ul className="space-y-2 text-xs text-wefin-text leading-relaxed">
            <li>
              • 방장이 <strong>"다음 턴"</strong> 버튼을 누르면 투표 시작
            </li>
            <li>
              • <strong>15초</strong> 안에 참가자 전원이 찬반 투표
            </li>
            <li>
              • <strong>과반수 찬성</strong>이면 다음 턴으로 이동
            </li>
            <li>• 시간 초과 시 현재 투표 결과로 판정</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
