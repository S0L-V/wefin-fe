import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import StepBriefing from './steps/StepBriefing'
import StepCreateRoom from './steps/StepCreateRoom'
import StepLobby from './steps/StepLobby'
import StepOrder from './steps/StepOrder'
import StepResult from './steps/StepResult'
import StepVote from './steps/StepVote'
import StepWaitingRoom from './steps/StepWaitingRoom'

const STEPS = [
  {
    id: 1,
    label: '로비',
    title: '게임 로비',
    desc: '새 게임을 만들거나, 진행 중인 방에 입장할 수 있습니다. 시드머니·기간·이동일수를 직접 설정하세요.',
    Component: StepLobby
  },
  {
    id: 2,
    label: '방 만들기',
    title: '게임 설정',
    desc: '시드머니, 게임 기간, 턴 이동일수를 설정해 나만의 게임방을 만들 수 있습니다. 설정에 따라 전략이 달라집니다.',
    Component: StepCreateRoom
  },
  {
    id: 3,
    label: '대기실',
    title: '대기실',
    desc: '참가자들이 모이면 방장이 게임을 시작합니다. 최대 6명까지 참여할 수 있어요.',
    Component: StepWaitingRoom
  },
  {
    id: 4,
    label: '브리핑',
    title: 'AI 시장 브리핑',
    desc: '각 턴이 시작되면 2주치 AI 뉴스 브리핑이 제공됩니다. 시장 개요, 주요 이슈, 투자 힌트를 참고하세요.',
    Component: StepBriefing
  },
  {
    id: 5,
    label: '매매',
    title: '종목 검색 & 매매',
    desc: '섹터 → 키워드 → 종목 순서로 탐색하거나, 직접 검색해서 매수·매도 주문을 넣으세요.',
    Component: StepOrder
  },
  {
    id: 6,
    label: '투표',
    title: '투표로 턴 전환',
    desc: '방장이 투표를 시작하면 15초 안에 찬반을 투표합니다. 과반수 찬성 시 다음 턴으로 이동합니다.',
    Component: StepVote
  },
  {
    id: 7,
    label: '결과',
    title: '결과 & 랭킹',
    desc: '게임 종료 후 자산 변동 그래프, AI 분석 리포트, 매매 내역, 최종 랭킹을 확인할 수 있습니다.',
    Component: StepResult
  }
]

export default function TutorialPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const step = STEPS[current]

  function goTo(index: number) {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }

  function prev() {
    if (current > 0) goTo(current - 1)
  }

  function next() {
    if (current < STEPS.length - 1) goTo(current + 1)
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 })
  }

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col bg-wefin-bg">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-4">
        {/* Header — 한 줄로 압축 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 rounded-lg border border-wefin-line bg-wefin-surface px-4 py-2 text-sm font-bold text-wefin-text transition-all hover:bg-wefin-surface-2"
          >
            <ArrowLeft size={18} />
            게임 로비
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-wefin-mint-deep to-wefin-mint shadow">
              <Play className="h-3.5 w-3.5 text-white" fill="white" />
            </div>
            <h1 className="text-base font-extrabold text-wefin-text sm:text-lg">게임 방법</h1>
          </div>
          <span className="font-num text-sm font-semibold text-wefin-muted">
            {current + 1} / {STEPS.length}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-3 flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => goTo(i)}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                  i === current
                    ? 'bg-wefin-mint text-white shadow-lg'
                    : i < current
                      ? 'bg-wefin-mint-deep text-white'
                      : 'border border-wefin-line bg-wefin-surface text-wefin-muted'
                }`}
              >
                {i + 1}
                <span
                  className={`absolute top-8 whitespace-nowrap text-[9px] font-semibold ${
                    i === current ? 'text-wefin-mint-deep' : 'text-wefin-muted'
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-6 sm:w-10 ${
                    i < current ? 'bg-wefin-mint-deep' : 'bg-wefin-line'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Info */}
        <motion.div
          key={`info-${step.id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-baseline gap-3"
        >
          <span className="inline-flex shrink-0 items-center rounded-full bg-wefin-mint-soft px-2.5 py-0.5 text-[11px] font-bold text-wefin-mint-deep">
            STEP {step.id}
          </span>
          <h2 className="text-[15px] font-extrabold text-wefin-text">{step.title}</h2>
          <p className="hidden text-[13px] text-wefin-subtle sm:block">{step.desc}</p>
        </motion.div>

        {/* Step Content */}
        <div className="card-base relative mt-3 min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full overflow-y-auto"
            >
              <step.Component />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-3 flex items-center justify-between pb-1">
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex items-center gap-2 rounded-lg border border-wefin-line bg-wefin-surface px-5 py-2 text-sm font-bold text-wefin-subtle transition-colors hover:bg-wefin-surface-2 disabled:opacity-30"
          >
            <ChevronLeft size={16} /> 이전
          </button>

          <button
            onClick={next}
            disabled={current === STEPS.length - 1}
            className="flex items-center gap-2 rounded-lg bg-wefin-mint px-5 py-2 text-sm font-bold text-white transition-all hover:bg-wefin-mint-deep disabled:opacity-30"
          >
            다음 <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
