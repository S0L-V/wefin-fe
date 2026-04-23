import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import WefinLogoIcon from '@/shared/ui/wefin-logo-icon'

import type { BriefingData } from '../model/briefing.schema'
import { useBriefingsQuery } from '../model/use-briefing-query'
import { useVoteStore } from '../model/use-vote-store'

interface MarketBriefingProps {
  roomId: string
}

function MarketBriefing({ roomId }: MarketBriefingProps) {
  const { data: briefings, isFetching, isError } = useBriefingsQuery(roomId)

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [flash, setFlash] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 턴이 바뀌면 선택을 당일(첫 번째)로 리셋 — useEffect 대신 ref 비교로 처리
  const todayDate = briefings?.[0]?.targetDate ?? null
  const prevTodayRef = useRef(todayDate)
  if (todayDate !== prevTodayRef.current) {
    prevTodayRef.current = todayDate
    if (selectedIndex !== 0) setSelectedIndex(0)
  }

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

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
  const selected: BriefingData | undefined = briefings?.[selectedIndex]

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
        {!isLoading && briefings && briefings.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-md border border-wefin-mint/30 bg-wefin-surface px-2 py-1 text-sm font-semibold tabular-nums text-wefin-text-2 transition-colors hover:border-wefin-mint/60 hover:bg-wefin-surface-hover"
            >
              {briefings[selectedIndex].targetDate.slice(5).replaceAll('-', '.')}
              {selectedIndex === 0 ? ' (오늘)' : ''}
              <ChevronDown
                size={14}
                className={`text-wefin-mint transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[110px] rounded-md border border-wefin-mint/20 bg-wefin-surface shadow-lg">
                <ul className="max-h-48 overflow-y-auto py-1 scrollbar-thin">
                  {briefings.map((b, i) => (
                    <li key={b.targetDate}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIndex(i)
                          setDropdownOpen(false)
                        }}
                        className={`w-full px-2.5 py-1.5 text-left text-sm tabular-nums transition-colors ${
                          i === selectedIndex
                            ? 'font-bold text-wefin-mint'
                            : 'font-medium text-wefin-text-2 hover:bg-wefin-surface-hover'
                        }`}
                      >
                        {b.targetDate.slice(5).replaceAll('-', '.')}
                        {i === 0 ? ' (오늘)' : ''}
                      </button>
                    </li>
                  ))}
                </ul>
                {briefings.length > 6 && (
                  <div className="flex items-center justify-center border-t border-wefin-line py-1">
                    <ChevronDown size={12} className="animate-bounce text-wefin-subtle" />
                  </div>
                )}
              </div>
            )}
          </div>
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

        {!isLoading && isError && !briefings && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-wefin-subtle">브리핑을 불러오지 못했습니다</p>
          </div>
        )}

        {!isLoading && selected && (
          <div className="space-y-5 text-sm leading-relaxed text-wefin-text">
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">시장 개요</h4>
              <p className="whitespace-pre-wrap break-words font-medium text-wefin-text-2">
                {selected.marketOverview}
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">주요 이슈</h4>
              <div className="whitespace-pre-wrap break-words font-medium text-wefin-text-2">
                {selected.keyIssues}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-wefin-mint-deep">투자 힌트</h4>
              <p className="whitespace-pre-wrap break-words font-medium text-wefin-text-2">
                {selected.investmentHint}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default MarketBriefing
