import { useEffect, useState } from 'react'

import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

import { useBriefingQuery } from '../model/use-briefing-query'
import { useVoteStore } from '../model/use-vote-store'

interface MarketBriefingProps {
  roomId: string
}

function MarketBriefing({ roomId }: MarketBriefingProps) {
  const { data, isFetching, isError } = useBriefingQuery(roomId)

  const [showLoading, setShowLoading] = useState(false)
  const [flash, setFlash] = useState(false)

  // Zustand subscribe로 투표 결과 변화 감지 (ESLint set-state-in-effect 우회)
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null

    const unsub = useVoteStore.subscribe((state, prev) => {
      // passed로 바뀌는 순간 → 로딩 시작 + 이전 타이머 취소
      if (state.result === 'passed' && prev.result !== 'passed') {
        if (timerId) clearTimeout(timerId)
        timerId = null
        setShowLoading(true)
      }
      // passed → null (모달 닫힘) → 1초 후 로딩 종료 + 번쩍
      if (prev.result === 'passed' && state.result === null) {
        timerId = setTimeout(() => {
          setShowLoading(false)
          setFlash(true)
        }, 1000)
      }
    })

    return () => {
      unsub()
      if (timerId) clearTimeout(timerId)
    }
  }, [])

  // 번쩍 효과 후 자동 해제
  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(() => setFlash(false), 700)
    return () => clearTimeout(timer)
  }, [flash])

  const isLoading = isFetching || showLoading

  return (
    <section
      className={`flex h-full min-h-0 flex-col overflow-hidden transition-colors duration-700 ${
        flash ? 'bg-wefin-mint/10' : ''
      }`}
    >
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-1.5">
          <WefinLogoIcon size={14} className="text-wefin-mint" />
          <span className="text-sm font-bold text-wefin-text">시장 브리핑</span>
        </div>
        {!isLoading && data?.targetDate && (
          <span className="text-sm font-semibold tabular-nums text-wefin-text-2">
            {data.targetDate.slice(5).replaceAll('-', '.')}
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-thin px-4 pb-4">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2">
              <WefinLogoIcon
                size={14}
                className="animate-[spinPause_2s_ease-in-out_infinite] text-wefin-mint"
              />
              <p className="text-xs text-wefin-subtle">새로운 브리핑을 불러오고 있습니다...</p>
            </div>
          </div>
        )}

        {!isLoading && isError && !data && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-wefin-subtle">브리핑을 불러오지 못했습니다</p>
          </div>
        )}

        {!isLoading && data && (
          <div className="space-y-5 text-sm leading-relaxed text-wefin-text">
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">시장 개요</h4>
              <p className="whitespace-pre-wrap break-words font-medium text-wefin-text-2">
                {data.marketOverview}
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">주요 이슈</h4>
              <div className="whitespace-pre-wrap break-words font-medium text-wefin-text-2">
                {data.keyIssues}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">투자 힌트</h4>
              <p className="whitespace-pre-wrap break-words font-medium text-wefin-text-2">
                {data.investmentHint}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default MarketBriefing
